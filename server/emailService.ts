import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const outboxDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(outboxDir)) {
  fs.mkdirSync(outboxDir, { recursive: true });
}
const outboxLog = path.join(outboxDir, 'outbox.log');

export interface TestimonyPayload {
  id: string;
  alias: string;
  contact: string;
  experience: string;
  submittedAt: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ''),
      },
    });
  }
  return null;
}

/**
 * Forwards tenancy experiences directly to the Host's Email inbox
 */
export async function forwardTestimonyToHost(testimony: TestimonyPayload) {
  const hostEmail = process.env.HOST_EMAIL || process.env.SMTP_USER || 'host@landlordsbc.org';
  const transporter = getTransporter();

  const subject = `[Landlords BC Intake] New Case #${testimony.id} from ${testimony.alias}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2d9cd; border-radius: 12px; background: #faf7f2; color: #2a1a12;">
      <h2 style="color: #3b2116; margin-top: 0;">New Landlord Tenancy Experience Filed</h2>
      <p style="font-size: 14px; color: #6b5a4e;">A member submitted a confidential tenancy report through the Landlords BC intake portal.</p>
      
      <div style="background: #ffffff; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #ebd9c8;">
        <p style="margin: 6px 0;"><strong>Case ID:</strong> <span style="color: #3b2116; font-weight: bold;">${testimony.id}</span></p>
        <p style="margin: 6px 0;"><strong>Preferred Alias:</strong> ${testimony.alias}</p>
        <p style="margin: 6px 0;"><strong>Confidential Contact:</strong> <a href="mailto:${testimony.contact}" style="color: #3b2116;">${testimony.contact}</a></p>
        <p style="margin: 6px 0;"><strong>Timestamp:</strong> ${testimony.submittedAt}</p>
      </div>

      <h3 style="color: #3b2116; margin-bottom: 8px;">Experience Narrative:</h3>
      <div style="background: #fdfaf7; padding: 16px; border-left: 4px solid #3b2116; font-style: italic; line-height: 1.6; white-space: pre-wrap;">
        "${testimony.experience}"
      </div>

      <hr style="border: none; border-top: 1px solid #e6ded5; margin: 24px 0;" />
      <p style="font-size: 12px; color: #8c7b6f; text-align: center;">
        Landlords BC Member Defense System · Zero-Disclosure Charter
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Landlords BC Intake" <${process.env.SMTP_FROM || hostEmail}>`,
        to: hostEmail,
        replyTo: testimony.contact.includes('@') ? testimony.contact : undefined,
        subject,
        html: htmlContent,
      });
      console.log(`[Email] Successfully forwarded Case #${testimony.id} to host inbox: ${hostEmail}`);
      return true;
    } catch (err: any) {
      console.error('[Email Error] Failed to send to host inbox:', err.message);
    }
  }

  // Fallback: log to outbox.log if SMTP is not yet configured in .env.local
  const logEntry = `\n--- [OUTBOX EMAIL TO HOST: ${hostEmail}] ---\nDate: ${new Date().toISOString()}\nSubject: ${subject}\nPayload: ${JSON.stringify(testimony, null, 2)}\n`;
  fs.appendFileSync(outboxLog, logEntry, 'utf8');
  console.log(`[Email Outbox] Host notification logged to server/data/outbox.log (Add SMTP_HOST, SMTP_USER, SMTP_PASS to send via live SMTP)`);
  return false;
}

/**
 * Sends a welcome & payment confirmation email to the paying user
 */
export async function sendPaymentWelcomeEmail(customerEmail: string, planName: string) {
  const transporter = getTransporter();
  const subject = `Welcome to Landlords BC — Payment Confirmed & Membership Dossier`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2d9cd; border-radius: 12px; background: #faf7f2; color: #2a1a12;">
      <h2 style="color: #3b2116; margin-top: 0;">Welcome to Landlords BC</h2>
      <p style="font-size: 15px; color: #2a1a12;">Thank you for your membership. Your payment for <strong>${planName}</strong> has been successfully processed.</p>
      
      <div style="background: #ffffff; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #ebd9c8;">
        <h3 style="margin-top: 0; color: #3b2116;">What is Included in Your Membership:</h3>
        <ul style="line-height: 1.6; color: #4a3a30; padding-left: 20px;">
          <li>Full BC Residential Tenancy Act (RTA) compliance guides</li>
          <li>Official unedited RTB statutory forms library</li>
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

  if (transporter && customerEmail && customerEmail.includes('@')) {
    try {
      const hostEmail = process.env.HOST_EMAIL || 'reddysantosh1310@gmail.com';
      await transporter.sendMail({
        from: `"Landlords BC Support" <${process.env.SMTP_FROM || 'support@landlordsbc.org'}>`,
        to: customerEmail,
        bcc: hostEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email] Dispatched welcome email to ${customerEmail}`);
      return true;
    } catch (err: any) {
      console.error('[Email Error] Failed to send welcome email:', err.message);
    }
  }

  const logEntry = `\n--- [OUTBOX EMAIL TO CUSTOMER: ${customerEmail}] ---\nDate: ${new Date().toISOString()}\nSubject: ${subject}\nPlan: ${planName}\n`;
  fs.appendFileSync(outboxLog, logEntry, 'utf8');
  return false;
}
