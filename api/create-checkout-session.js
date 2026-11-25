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
        error: 'STRIPE_SECRET_KEY is not configured in Vercel Environment Variables',
      });
    }

    const stripe = new Stripe(secretKey);
    const { plan, email, returnUrl } = req.body || {};
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin =
      returnUrl || req.headers.origin || `${protocol}://${host}`;

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

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to create checkout session',
    });
  }
}
