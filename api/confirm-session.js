import Stripe from 'stripe';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { sessionId } = req.body || {};
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(400).json({ error: 'STRIPE_SECRET_KEY is not configured' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });

    const customerEmail =
      session.customer_details?.email ||
      (session.customer && session.customer.email) ||
      session.customer_email;

    const customerName =
      session.customer_details?.name ||
      (session.customer && session.customer.name) ||
      (customerEmail ? customerEmail.split('@')[0] : 'Verified Landlord');

    const planName =
      session.line_items?.data[0]?.description ||
      session.metadata?.plan ||
      'Individual Membership ($290 CAD / month)';

    const memberId = `BC-MEM-${session.id.slice(-4).toUpperCase()}`;

    // Dispatch welcome email via SMTP if configured
    let emailDispatched = false;
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT) || 587;

    if (customerEmail && host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass: pass.replace(/\s+/g, ''),
          },
        });

        const subject = `Welcome to Landlords BC — Payment Confirmed & Membership Dossier`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2d9cd; border-radius: 12px; background: #faf7f2; color: #2a1a12;">
            <h2 style="color: #3b2116; margin-top: 0;">Welcome to Landlords BC</h2>
            <p style="font-size: 15px; color: #2a1a12;">Thank you for your membership. Your payment for <strong>${planName}</strong> has been successfully processed.</p>
            
            <div style="background: #ffffff; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #ebd9c8;">
              <h3 style="margin-top: 0; color: #3b2116;">Your Active Membership Details:</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Member ID:</strong> ${memberId}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Registered Account:</strong> ${customerEmail}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Coverage:</strong> BC Residential Tenancy Act (RTA) Complete Defense</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Advisor Helpline:</strong> 1-888-330-6707 (Mon–Fri, 9:00 AM – 4:30 PM PT)</p>
            </div>

            <p style="font-size: 13px; color: #6b5a4e;">
              All records and identity data are sealed under the Landlords BC Zero-Disclosure Charter.
            </p>
          </div>
        `;

        const hostEmail = process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
        await transporter.sendMail({
          from: `"Landlords BC Support" <${process.env.SMTP_FROM || user}>`,
          to: customerEmail.trim().toLowerCase(),
          bcc: hostEmail,
          subject,
          html: htmlContent,
        });
        emailDispatched = true;
      } catch (mailErr) {
        console.error('[confirm-session] Mail sending error:', mailErr);
      }
    }

    return res.status(200).json({
      success: true,
      email: customerEmail,
      name: customerName,
      plan: planName,
      memberId,
      emailDispatched,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error('[confirm-session] Error:', error);
    return res.status(500).json({ error: error.message || 'Session confirmation failed' });
  }
}