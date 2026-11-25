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

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(400).json({
        error: 'STRIPE_SECRET_KEY is not configured',
      });
    }

    const stripe = new Stripe(secretKey);

    // Get email from query params or body
    const email = (req.query?.email || req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid member email is required' });
    }

    // 1. Fetch customers with this email
    const customers = await stripe.customers.list({ email, limit: 10 });
    const customerIds = customers.data.map((c) => c.id);

    // 2. Fetch charges (limit 50) and filter by email / customer
    const chargesList = await stripe.charges.list({ limit: 50 });
    const userCharges = chargesList.data.filter((ch) => {
      const bEmail = (ch.billing_details?.email || '').toLowerCase();
      const rEmail = (ch.receipt_email || '').toLowerCase();
      return bEmail === email || rEmail === email || (ch.customer && customerIds.includes(ch.customer));
    });

    // 3. Fetch invoices and filter by email / customer
    const invoicesList = await stripe.invoices.list({ limit: 50 });
    const userInvoices = invoicesList.data.filter((inv) => {
      const invEmail = (inv.customer_email || '').toLowerCase();
      return invEmail === email || (inv.customer && customerIds.includes(inv.customer));
    });

    // 4. Fetch checkout sessions and filter by email / customer
    const sessionsList = await stripe.checkout.sessions.list({ limit: 50 });
    const userSessions = sessionsList.data.filter((s) => {
      const sEmail = (s.customer_email || s.customer_details?.email || '').toLowerCase();
      return sEmail === email || (s.customer && customerIds.includes(s.customer));
    });

    // Build unified transaction records
    const payments = [];
    const seenTxIds = new Set();

    // Map invoices (preferred for billing with numbers & pdfs)
    for (const inv of userInvoices) {
      if (inv.status === 'paid' && inv.total > 0) {
        seenTxIds.add(inv.id);
        payments.push({
          id: inv.id,
          type: 'invoice',
          amount: inv.total / 100,
          currency: (inv.currency || 'cad').toUpperCase(),
          status: 'paid',
          date: new Date(inv.created * 1000).toISOString(),
          description: inv.description || inv.lines?.data[0]?.description || 'Landlords BC Annual Membership',
          invoiceNumber: inv.number || `LBC-INV-${inv.id.slice(-6).toUpperCase()}`,
          receiptUrl: inv.hosted_invoice_url,
          invoiceUrl: inv.hosted_invoice_url,
          invoicePdf: inv.invoice_pdf,
        });
      }
    }

    // Map charges that are not already represented by an invoice
    for (const ch of userCharges) {
      if (ch.status === 'succeeded' && ch.paid) {
        const isInvoiceCharge = ch.invoice && seenTxIds.has(ch.invoice);
        if (!isInvoiceCharge) {
          seenTxIds.add(ch.id);
          payments.push({
            id: ch.id,
            type: 'charge',
            amount: ch.amount / 100,
            currency: (ch.currency || 'cad').toUpperCase(),
            status: 'paid',
            date: new Date(ch.created * 1000).toISOString(),
            description: ch.description || 'Landlords BC Membership Payment',
            invoiceNumber: `LBC-CHG-${ch.id.slice(-6).toUpperCase()}`,
            receiptUrl: ch.receipt_url,
            invoiceUrl: ch.receipt_url,
            invoicePdf: null,
          });
        }
      }
    }

    // Sort by date descending (newest first)
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total paid across test transactions
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    return res.status(200).json({
      email,
      customerId: customerIds[0] || null,
      isTestMode: secretKey.startsWith('sk_test_'),
      hasPayments: payments.length > 0,
      totalPaid,
      payments,
      sessionsCount: userSessions.length,
    });
  } catch (error) {
    console.error('[Stripe Get Payments Error]:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to retrieve payments from Stripe',
    });
  }
}
