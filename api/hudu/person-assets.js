export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personId } = req.body;
  if (!personId) {
    return res.status(400).json({ error: 'Person ID is required' });
  }

  try {
    const HUDU_API_KEY = process.env.HUDU_API_KEY;
    const HUDU_SUBDOMAIN = process.env.HUDU_SUBDOMAIN;
    const HUDU_BASE_URL = `https://${HUDU_SUBDOMAIN}.huducloud.com/api/v1`;

    // קודם נשיג את פרטי האדם
    const personResponse = await fetch(`${HUDU_BASE_URL}/assets/${personId}`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });

    if (!personResponse.ok) {
      throw new Error(`Person not found: ${personResponse.status}`);
    }

    const personData = await personResponse.json();
    const personName = personData.asset?.name || 'Unknown';

    // בינתיים נחזיר תשובה ריקה אבל בלי שגיאות
    res.json({ 
      assets: [], // רשימה ריקה במקום undefined
      personName: personName,
      message: `לא נמצאו נכס
