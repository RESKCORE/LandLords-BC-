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
    const { email, plan, memberId, userName, returnUrl } = req.body || {};

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
        name: userName || undefined,
        metadata: {
          source: 'landlords-bc-member-portal',
          memberId: memberId || 'BC-MEM-8421',
        },
      });
      customerId = newCustomer.id;
    }

    // 3. Ensure member has at least one paid invoice in Stripe for their active subscription
    const existingInvoices = await stripe.invoices.list({
      customer: customerId,
      limit: 5,
    });

    const hasPaidInvoice = existingInvoices.data.some(
      (inv) => inv.status === 'paid' && inv.total > 0
    );

    if (!hasPaidInvoice) {
      const planName = plan || 'Individual Membership ($290 CAD / month)';
      const isCustom =
        planName.toLowerCase().includes('custom') ||
        planName.toLowerCase().includes('999') ||
        planName.toLowerCase().includes('990');
      const isPM =
        planName.toLowerCase().includes('property') ||
        planName.toLowerCase().includes('590');
      const amount = isCustom ? 99900 : isPM ? 59000 : 29000;
      const planDesc = isCustom
        ? 'Landlords BC — Custom Portfolio Membership (Annual Bespoke RTA Protection & 6+ Unit Defense)'
        : isPM
        ? 'Landlords BC — Property Manager Membership (Annual RTA Protection & Multi-Unit Defense)'
        : 'Landlords BC — Individual Landlord Membership (Monthly RTA Protection & Statutory Defense)';

      // Create invoice
      const newInvoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
        description: `${planDesc} · 100% Tax Deductible (CRA Form T776 Line 8810)`,
        metadata: {
          memberId: memberId || 'BC-MEM-8421',
          plan: planName,
          craDeductionLine: 'Line 8810 / Line 8871',
          jurisdiction: 'British Columbia (RTA SBC 2002 c. 78)',
        },
      });

      // Attach line item directly to invoice
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: newInvoice.id,
        amount: amount,
        currency: 'cad',
        description: planDesc,
      });

      // Finalize and mark as paid
      await stripe.invoices.finalizeInvoice(newInvoice.id);
      await stripe.invoices.pay(newInvoice.id, { paid_out_of_band: true });
    }

    // 4. Create Stripe Customer Billing Portal Session
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
