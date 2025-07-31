export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

    if (!HUDU_API_KEY || !HUDU_SUBDOMAIN) {
      return res.status(500).json({ error: 'Missing Hudu configuration' });
    }

    const HUDU_BASE_URL = `https://${HUDU_SUBDOMAIN}.huducloud.com/api/v1`;

    // Get asset relations
    const relationsResponse = await fetch(`${HUDU_BASE_URL}/assets/${personId}/relations`, {
      headers: {
        'x-api-key': HUDU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!relationsResponse.ok) {
      throw new Error(`Hudu relations API error: ${relationsResponse.status}`);
    }

    const relationsData = await relationsResponse.json();
    const relations = relationsData.relations || [];

    // Get detailed information for each related asset
    const assetPromises = relations.map(async (relation) => {
      try {
        const assetResponse = await fetch(`${HUDU_BASE_URL}/assets/${relation.toable_id}`, {
          headers: {
            'x-api-key': HUDU_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (assetResponse.ok) {
          const assetData = await assetResponse.json();
          return {
            ...assetData.asset,
            url: `https://${HUDU_SUBDOMAIN}.huducloud.com/a/assets/${relation.toable_id}`
          };
        }
        return null;
      } catch (err) {
        console.error(`Error fetching asset ${relation.toable_id}:`, err);
        return null;
      }
    });

    const assets = await Promise.all(assetPromises);
    const validAssets = assets.filter(asset => asset !== null);

    res.json({ assets: validAssets });

  } catch (error) {
    console.error('Error getting person assets:', error);
    res.status(500).json({ error: error.message });
  }
}
