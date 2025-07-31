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

    // Get the person's asset details first
    const personResponse = await fetch(`${HUDU_BASE_URL}/assets/${personId}`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });

    if (!personResponse.ok) {
      throw new Error(`Failed to get person: ${personResponse.status}`);
    }

    const personData = await personResponse.json();
    const asset = personData.asset;

    // Check if there are related items
    const relatedItems = asset.related_items || [];

    res.json({ 
      assets: relatedItems,
      personName: asset.name,
      totalAssets: relatedItems.length 
    });

  } catch (error) {
    console.error('Error getting person assets:', error);
    res.status(500).json({ error: error.message });
  }
}
