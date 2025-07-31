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

    // Try to get all assets and filter by the person
    const allAssetsResponse = await fetch(`${HUDU_BASE_URL}/assets`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });

    if (!allAssetsResponse.ok) {
      throw new Error(`Failed to get assets: ${allAssetsResponse.status}`);
    }

    const allAssetsData = await allAssetsResponse.json();
    const assets = allAssetsData.assets || [];

    // Find assets that might be related to this person
    const relatedAssets = assets.filter(asset => {
      // Check if the asset mentions the person in any field
      if (asset.fields) {
        return asset.fields.some(field => 
          field.value && field.value.toString().includes('ronit')
        );
      }
      return false;
