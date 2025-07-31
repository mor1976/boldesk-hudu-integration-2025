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

    // חיפוש בכל הנכסים עבור נכסים שקשורים לאדם הספציפי
    const allAssetsResponse = await fetch(`${HUDU_BASE_URL}/assets`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });

    if (!allAssetsResponse.ok) {
      throw new Error(`Failed to get assets: ${allAssetsResponse.status}`);
    }

    const allAssetsData = await allAssetsResponse.json();
    const assets = allAssetsData.assets || [];

    // מציאת נכסים שמכילים את ה-person ID או שמים דומים
    const relatedAssets = assets.filter(asset => {
      // חיפוש לפי קשרים בשדות
      return asset.fields && asset.fields.some(field => {
        if (field.value) {
          const fieldValue = field.value.toString().toLowerCase();
          // חיפוש לפי ID או שמות
          return fieldValue.includes(personId.toString()) || 
                 fieldValue.includes('ronit') ||
                 fieldValue.includes('רונית');
        }
        return false;
      });
    });

    res.json({ 
      assets: relatedAssets.map(asset => ({
        id: asset.id,
        name: asset.name,
        asset_type: asset.asset_type || 'Unknown',
        url: `https://${HUDU_SUBDOMAIN}.huducloud.com/a/assets/${asset.id}`
      })),
      totalFound: relatedAssets.length,
      personId: personId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
