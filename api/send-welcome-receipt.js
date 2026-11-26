import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, plan } = req.body || {};
  const targetEmail = (email || '').trim().toLowerCase();
  const planName = plan || 'Individual Membership ($290 CAD / month)';

  if (!targetEmail || !targetEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
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
            <h3 style="margin-top: 0; color: #3b2116;">What is Included in Your Membership:</h3>
            <ul style="line-height: 1.6; color: #4a3a30; padding-left: 20px;">
              <li>Full BC Residential Tenancy Act (RTA) compliance guides</li>
              <li>Official unedited RTB statutory forms library (RTB-30, RTB-27, RTB-7, RTB-33)</li>
              <li>Condition Inspection Report sequence templates</li>
              <li>Confidential member advisor helpline: <strong>1-888-330-6707</strong> (Mon–Fri, 9:00 AM – 4:30 PM PT)</li>
              <li>Direct advisor email desk: <strong>support@landlordsbc.org</strong></li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #6b5a4e;">
            Your identity is sealed under the Landlords BC Zero-Disclosure Charter.
          </p>
        </div>
      `;

      const hostEmail = process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
      await transporter.sendMail({
        from: `"Landlords BC Support" <${process.env.SMTP_FROM || user}>`,
        to: targetEmail,
        bcc: hostEmail,
        subject,
        html: htmlContent,
      });

      return res.status(200).json({ success: true, email: targetEmail, dispatched: true });
    } catch (err) {
      console.error('[Send Welcome Receipt Error]:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).json({ success: true, email: targetEmail, dispatched: false, note: 'SMTP not configured' });
}