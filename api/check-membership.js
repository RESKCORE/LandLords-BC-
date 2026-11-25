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

  return res.status(200).json({ isMember: false });
}
