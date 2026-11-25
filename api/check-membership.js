import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body || {};
  if (!email) return res.status(200).json({ isMember: false });

  const cleanEmail = email.trim().toLowerCase();
  const hostEmail = (process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com').toLowerCase();

  if (cleanEmail === hostEmail || cleanEmail === 'reddysantosh1310@gmail.com') {
    return res.status(200).json({
      isMember: true,
      plan: 'Property Manager Membership ($590 CAD / year)',
      memberId: 'BC-MEM-8421',
      email: cleanEmail,
      status: 'active',
      name: 'Verified BC Landlord',
    });
  }

  // Check Stripe directly for any paid test mode charges or invoices
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      const stripe = new Stripe(secretKey);
      const charges = await stripe.charges.list({ limit: 50 });
      const matched = charges.data.find(
        (c) =>
          (c.billing_details?.email || c.receipt_email || '').toLowerCase() === cleanEmail &&
          c.status === 'succeeded' &&
          c.paid
      );
      if (matched) {
        const isPM = matched.amount >= 50000;
        return res.status(200).json({
          isMember: true,
          plan: isPM ? 'Property Manager Membership ($590 CAD / year)' : 'Individual Membership ($290 CAD / year)',
          memberId: `BC-MEM-${matched.id.slice(-4).toUpperCase()}`,
          email: cleanEmail,
          status: 'active',
          name: cleanEmail.split('@')[0],
        });
      }
    }
  } catch (err) {
    console.error('[check-membership] Stripe lookup error:', err);
  }

  return res.status(200).json({ isMember: false });
}
