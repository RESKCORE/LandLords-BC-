import type { ViteDevServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { forwardTestimonyToHost, sendPaymentWelcomeEmail } from './emailService.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const testimoniesFile = path.join(dataDir, 'testimonies.json');
const membersFile = path.join(dataDir, 'members.json');

function getMembers(): any[] {
  if (fs.existsSync(membersFile)) {
    try {
      return JSON.parse(fs.readFileSync(membersFile, 'utf8'));
    } catch (_) {}
  }
  return [];
}

function saveMember(member: {
  email: string;
  name?: string;
  plan: string;
  memberId: string;
  status?: string;
  joinedAt?: string;
}) {
  const members = getMembers();
  const existingIdx = members.findIndex(
    (m: any) => m.email && m.email.toLowerCase() === member.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    members[existingIdx] = { ...members[existingIdx], ...member };
  } else {
    members.unshift(member);
  }
  fs.writeFileSync(membersFile, JSON.stringify(members, null, 2));
}

export function stripePlugin() {
  return {
    name: 'stripe-checkout-endpoint',
    configureServer(server: ViteDevServer) {
      // 1. Stripe Checkout Session Endpoint
      server.middlewares.use('/api/create-checkout-session', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (!secretKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'STRIPE_SECRET_KEY is not configured in .env.local',
                })
              );
              return;
            }

            const stripe = new Stripe(secretKey);
            const { plan, email, returnUrl } = JSON.parse(body || '{}');

            const origin =
              returnUrl || req.headers.origin || 'http://localhost:3000';

            const planDetails: Record<
              string,
              { name: string; amount: number; description: string }
            > = {
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

            // Find or create customer to bind the payment to their persistent Stripe profile
            let customerId: string | undefined;
            if (email && email.includes('@')) {
              const cleanEmail = email.trim().toLowerCase();
              const existingCust = await stripe.customers.list({
                email: cleanEmail,
                limit: 1,
              });
              if (existingCust.data.length > 0) {
                customerId = existingCust.data[0].id;
              } else {
                const createdCust = await stripe.customers.create({
                  email: cleanEmail,
                  metadata: { source: 'landlords-bc-checkout' },
                });
                customerId = createdCust.id;
              }
            }

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
              customer: customerId,
              customer_email: customerId ? undefined : (email && email.includes('@') ? email : undefined),
              invoice_creation: {
                enabled: true,
                invoice_data: {
                  description: `${selected.name} · 100% Tax Deductible (CRA Form T776 Line 8810)`,
                  custom_fields: [
                    { name: 'CRA Tax Deductibility', value: 'Form T776 Line 8810 / 8871' },
                    { name: 'Jurisdiction', value: 'British Columbia, Canada' },
                  ],
                },
              },
              success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${origin}/?status=cancelled`,
            });

            // Dispatch welcome confirmation email asynchronously if email provided
            if (email && email.includes('@')) {
              sendPaymentWelcomeEmail(email, selected.name).catch((e) =>
                console.error('[Welcome Email Error]:', e.message)
              );
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: session.url }));
          } catch (error: any) {
            console.error('Stripe Checkout Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: error?.message || 'Failed to create checkout session',
              })
            );
          }
        });
      });

      // 2. Tenancy Experience / Testimony Storage & Host Email Endpoint
      server.middlewares.use('/api/submit-testimony', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const newRecord = {
              id: `BC-${Date.now().toString().slice(-4)}`,
              alias: data.alias || 'Anonymous Landlord',
              contact: data.contact || '',
              experience: data.experience || '',
              submittedAt: new Date().toISOString(),
            };

            // 1. Save to database file
            let existing: any[] = [];
            if (fs.existsSync(testimoniesFile)) {
              try {
                existing = JSON.parse(fs.readFileSync(testimoniesFile, 'utf8'));
              } catch (_) {
                existing = [];
              }
            }
            existing.unshift(newRecord);
            fs.writeFileSync(testimoniesFile, JSON.stringify(existing, null, 2));

            // 2. Forward directly to host's email inbox
            await forwardTestimonyToHost(newRecord);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, recordId: newRecord.id }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Storage error' }));
          }
        });
      });

      // 3. Direct Send Welcome / Receipt Email Endpoint & Member Recording
      server.middlewares.use('/api/send-welcome-receipt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { email, plan, name } = JSON.parse(body || '{}');
            const targetEmail =
              email || process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
            const planName =
              plan || 'Individual Membership ($290 CAD / year)';
            
            // Record as active member
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, email: targetEmail, memberId }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // 4. Check Membership by Email (for instant identification on Google sign-in)
      server.middlewares.use('/api/check-membership', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body || '{}');
            if (!email) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ isMember: false }));
              return;
            }

            const cleanEmail = email.trim().toLowerCase();
            const hostEmail = (process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com').toLowerCase();

            // Host / Admin email is always an active member
            if (cleanEmail === hostEmail || cleanEmail === 'reddysantosh1310@gmail.com') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  isMember: true,
                  plan: 'Property Manager Membership ($590 CAD / year)',
                  memberId: 'BC-MEM-8421',
                  email: cleanEmail,
                  status: 'active',
                  name: 'Verified BC Landlord',
                })
              );
              return;
            }

            const members = getMembers();
            const found = members.find(
              (m: any) => m.email && m.email.toLowerCase() === cleanEmail && m.status === 'active'
            );

            if (found) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  isMember: true,
                  plan: found.plan || 'Individual Membership ($290 CAD / year)',
                  memberId: found.memberId || 'BC-MEM-7740',
                  email: found.email,
                  status: found.status,
                  name: found.name,
                })
              );
              return;
            }

            // Check Stripe directly for paid charges/invoices
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (secretKey) {
              try {
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
                  const plan = isPM
                    ? 'Property Manager Membership ($590 CAD / year)'
                    : 'Individual Membership ($290 CAD / year)';
                  const memberId = `BC-MEM-${matched.id.slice(-4).toUpperCase()}`;
                  saveMember({
                    email: cleanEmail,
                    name: cleanEmail.split('@')[0],
                    plan,
                    memberId,
                    status: 'active',
                    joinedAt: new Date(matched.created * 1000).toISOString(),
                  });
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      isMember: true,
                      plan,
                      memberId,
                      email: cleanEmail,
                      status: 'active',
                      name: cleanEmail.split('@')[0],
                    })
                  );
                  return;
                }
              } catch (_) {}
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ isMember: false }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // 5. Register Membership Endpoint
      server.middlewares.use('/api/register-membership', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { email, name, plan } = JSON.parse(body || '{}');
            if (!email) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Email required' }));
              return;
            }

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

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, member }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // 6. Create Stripe Customer Billing Portal Session
      server.middlewares.use('/api/create-portal-session', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (!secretKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'STRIPE_SECRET_KEY is not configured in .env.local',
                })
              );
              return;
            }

            const stripe = new Stripe(secretKey);
            const { email, plan, memberId, userName, returnUrl } = JSON.parse(body || '{}');

            if (!email || !email.includes('@')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({ error: 'Valid member email is required' })
              );
              return;
            }

            const cleanEmail = email.trim().toLowerCase();
            const origin =
              returnUrl || req.headers.origin || 'http://localhost:3000';

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
              const planName = plan || 'Individual Membership ($290 CAD / year)';
              const isPM =
                planName.toLowerCase().includes('property') ||
                planName.toLowerCase().includes('590');
              const amount = isPM ? 59000 : 29000;
              const planDesc = isPM
                ? 'Landlords BC — Property Manager Membership (Annual RTA Protection & Multi-Unit Defense)'
                : 'Landlords BC — Individual Landlord Membership (Annual RTA Protection & Statutory Defense)';

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

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: portalSession.url }));
          } catch (err: any) {
            console.error('[Stripe Billing Portal Error]:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err.message || 'Billing portal session creation failed',
              })
            );
          }
        });
      });

      // 7. Get Member's Live Stripe Payments Endpoint
      server.middlewares.use('/api/get-stripe-payments', async (req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (!secretKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'STRIPE_SECRET_KEY is not configured in .env.local' }));
              return;
            }

            const stripe = new Stripe(secretKey);

            // Extract email from query string or body
            let email = '';
            if (req.url && req.url.includes('?')) {
              const urlParams = new URLSearchParams(req.url.split('?')[1]);
              email = urlParams.get('email') || '';
            }
            if (!email && body) {
              try {
                const parsed = JSON.parse(body);
                email = parsed.email || '';
              } catch (_) {}
            }

            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail || !cleanEmail.includes('@')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Valid member email is required' }));
              return;
            }

            // 1. Fetch customer records
            const customers = await stripe.customers.list({ email: cleanEmail, limit: 10 });
            const customerIds = customers.data.map((c) => c.id);

            // 2. Fetch charges (limit 50)
            const chargesList = await stripe.charges.list({ limit: 50 });
            const userCharges = chargesList.data.filter((ch) => {
              const bEmail = (ch.billing_details?.email || '').toLowerCase();
              const rEmail = (ch.receipt_email || '').toLowerCase();
              return bEmail === cleanEmail || rEmail === cleanEmail || (ch.customer && customerIds.includes(ch.customer as string));
            });

            // 3. Fetch invoices (limit 50)
            const invoicesList = await stripe.invoices.list({ limit: 50 });
            const userInvoices = invoicesList.data.filter((inv) => {
              const invEmail = (inv.customer_email || '').toLowerCase();
              return invEmail === cleanEmail || (inv.customer && customerIds.includes(inv.customer as string));
            });

            // 4. Fetch checkout sessions (limit 50)
            const sessionsList = await stripe.checkout.sessions.list({ limit: 50 });
            const userSessions = sessionsList.data.filter((s) => {
              const sEmail = (s.customer_email || s.customer_details?.email || '').toLowerCase();
              return sEmail === cleanEmail || (s.customer && customerIds.includes(s.customer as string));
            });

            // Build unified transaction records
            const payments: any[] = [];
            const seenTxIds = new Set<string>();

            // Map invoices (preferred for billing with numbers & pdfs)
            for (const inv of userInvoices) {
              if (inv.status === 'paid' && (inv.total || 0) > 0) {
                seenTxIds.add(inv.id);
                payments.push({
                  id: inv.id,
                  type: 'invoice',
                  amount: (inv.total || 0) / 100,
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
                const isInvoiceCharge = (ch as any).invoice && seenTxIds.has((ch as any).invoice as string);
                if (!isInvoiceCharge) {
                  seenTxIds.add(ch.id);
                  payments.push({
                    id: ch.id,
                    type: 'charge',
                    amount: (ch.amount || 0) / 100,
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

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                email: cleanEmail,
                customerId: customerIds[0] || null,
                isTestMode: secretKey.startsWith('sk_test_'),
                hasPayments: payments.length > 0,
                totalPaid,
                payments,
                sessionsCount: userSessions.length,
              })
            );
          } catch (err: any) {
            console.error('[Stripe Get Payments Error]:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to retrieve payments' }));
          }
        });
      });
    },
  };
}
