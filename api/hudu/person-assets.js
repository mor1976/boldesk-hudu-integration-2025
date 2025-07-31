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

    // Get relations
    const relationsResponse = await fetch(`${HUDU_BASE_URL}/assets/${personId}/relations`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });
    const relationsData = await relationsResponse.json();
    const relations = relationsData.relations || [];

    // Get asset details
    const assetPromises = relations.map(async (relation) => {
      try {
        const assetResponse = await fetch(`${HUDU_BASE_URL}/assets/${relation.toable_id}`, {
          headers: { 'x-api-key': HUDU_API_KEY }
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
        return null;
      }
    });

    const assets = await Promise.all(assetPromises);
    const validAssets = assets.filter(asset => asset !== null);

    res.json({ assets: validAssets });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
