import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { forwardTestimonyToHost, sendPaymentWelcomeEmail } from './server/emailService.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const testimoniesFile = path.join(dataDir, 'testimonies.json');

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({
        error: 'STRIPE_SECRET_KEY is not configured in .env.local',
      });
    }

    const { plan, email, returnUrl } = req.body || {};
    const origin =
      returnUrl || req.headers.origin || `http://localhost:${port}`;

    const planDetails = {
      individual: {
        name: 'Landlords BC — Individual Membership',
        amount: 29000, // $290.00 CAD
        description:
          'Annual self-managing landlord membership & confidential defense under the BC RTA.',
      },
      'property-manager': {
        name: 'Landlords BC — Property Manager Membership',
        amount: 59000, // $590.00 CAD
        description:
          'Annual professional property manager tier with multi-unit records and advocacy reporting.',
      },
      custom: {
        name: 'Landlords BC — Custom Portfolio Membership',
        amount: 99000, // $990.00 CAD
        description:
          'Bespoke multi-unit portfolio regulatory support & private helpline priority.',
      },
    };

    const selected = planDetails[plan] || planDetails.individual;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: selected.name,
              description: selected.description,
            },
            unit_amount: selected.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email && email.includes('@') ? email : undefined,
      success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?status=cancelled`,
    });

    if (email && email.includes('@')) {
      sendPaymentWelcomeEmail(email, selected.name).catch((e) =>
        console.error('[Welcome Email Error]:', e.message)
      );
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to create checkout session',
    });
  }
});

app.post('/api/submit-testimony', async (req, res) => {
  try {
    const data = req.body || {};
    const newRecord = {
      id: `BC-${Date.now().toString().slice(-4)}`,
      alias: data.alias || 'Anonymous Landlord',
      contact: data.contact || '',
      experience: data.experience || '',
      submittedAt: new Date().toISOString(),
    };

    let existing = [];
    if (fs.existsSync(testimoniesFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(testimoniesFile, 'utf8'));
      } catch (_) {
        existing = [];
      }
    }
    existing.unshift(newRecord);
    fs.writeFileSync(testimoniesFile, JSON.stringify(existing, null, 2));

    await forwardTestimonyToHost(newRecord);

    res.json({ success: true, recordId: newRecord.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Storage error' });
  }
});

const membersFile = path.join(dataDir, 'members.json');

function getMembers() {
  if (fs.existsSync(membersFile)) {
    try {
      return JSON.parse(fs.readFileSync(membersFile, 'utf8'));
    } catch (_) {}
  }
  return [];
}

function saveMember(member) {
  const members = getMembers();
  const existingIdx = members.findIndex(
    (m) => m.email && m.email.toLowerCase() === member.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    members[existingIdx] = { ...members[existingIdx], ...member };
  } else {
    members.unshift(member);
  }
  fs.writeFileSync(membersFile, JSON.stringify(members, null, 2));
}

app.post('/api/send-welcome-receipt', async (req, res) => {
  try {
    const { email, plan, name } = req.body || {};
    const targetEmail =
      email || process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
    const planName = plan || 'Individual Membership ($290 CAD / year)';

    const memberId = `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    saveMember({
      email: targetEmail,
      name: name || targetEmail.split('@')[0],
      plan: planName,
      memberId,
      status: 'active',
      joinedAt: new Date().toISOString(),
    });

    await sendPaymentWelcomeEmail(targetEmail, planName);
    res.json({ success: true, email: targetEmail, memberId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/check-membership', (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.json({ isMember: false });

    const cleanEmail = email.trim().toLowerCase();
    const hostEmail = (process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com').toLowerCase();

    if (cleanEmail === hostEmail || cleanEmail === 'reddysantosh1310@gmail.com') {
      return res.json({
        isMember: true,
        plan: 'Property Manager Membership ($590 CAD / year)',
        memberId: 'BC-MEM-8421',
        email: cleanEmail,
        status: 'active',
        name: 'Verified BC Landlord',
      });
    }

    const members = getMembers();
    const found = members.find(
      (m) => m.email && m.email.toLowerCase() === cleanEmail && m.status === 'active'
    );

    if (found) {
      return res.json({
        isMember: true,
        plan: found.plan || 'Individual Membership ($290 CAD / year)',
        memberId: found.memberId || 'BC-MEM-7740',
        email: found.email,
        status: found.status,
        name: found.name,
      });
    }

    res.json({ isMember: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register-membership', (req, res) => {
  try {
    const { email, name, plan } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    const cleanEmail = email.trim().toLowerCase();
    const memberId = `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const member = {
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      plan: plan || 'Individual Membership ($290 CAD / year)',
      memberId,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };
    saveMember(member);
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
