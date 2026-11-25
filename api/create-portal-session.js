import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(400).json({
        error: 'STRIPE_SECRET_KEY is not configured in environment variables',
      });
    }

    const stripe = new Stripe(secretKey);
    const { email, returnUrl } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid member email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin =
      returnUrl || req.headers.origin || `${protocol}://${host}`;

    // 1. Find existing customer by email in Stripe
    const customers = await stripe.customers.list({
      email: cleanEmail,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;

    // 2. If no customer exists yet under that email in Stripe, create one
    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: cleanEmail,
        metadata: {
          source: 'landlords-bc-member-portal',
        },
      });
      customerId = newCustomer.id;
    }

    // 3. Create Stripe Customer Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard` || `${origin}`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe Customer Portal Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to create billing portal session',
    });
  }
}
