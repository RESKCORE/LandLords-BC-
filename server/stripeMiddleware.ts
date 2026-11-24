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

      // 3. Direct Send Welcome / Receipt Email Endpoint
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
            const { email, plan } = JSON.parse(body || '{}');
            const targetEmail =
              email || process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
            const planName =
              plan || 'Individual Membership ($290 CAD / year)';
            await sendPaymentWelcomeEmail(targetEmail, planName);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, email: targetEmail }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}
