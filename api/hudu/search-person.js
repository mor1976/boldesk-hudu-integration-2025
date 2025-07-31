export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const HUDU_API_KEY = process.env.HUDU_API_KEY;
    const HUDU_SUBDOMAIN = process.env.HUDU_SUBDOMAIN;

    const HUDU_BASE_URL = `https://${HUDU_SUBDOMAIN}.huducloud.com/api/v1`;

    // Get People layout
    const layoutsResponse = await fetch(`${HUDU_BASE_URL}/asset_layouts`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });
    const layoutsData = await layoutsResponse.json();
    const peopleLayout = layoutsData.asset_layouts.find(
      layout => layout.name.toLowerCase().includes('people')
    );

    if (!peopleLayout) {
      return res.status(404).json({ error: 'People layout not found' });
    }

    // Search for person
    const assetsResponse = await fetch(`${HUDU_BASE_URL}/assets?asset_layout_id=${peopleLayout.id}&search=${encodeURIComponent(email)}`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });
    const assetsData = await assetsResponse.json();

    const person = assetsData.assets?.find(asset => {
      return asset.fields?.some(field => 
        field.value && field.value.toLowerCase() === email.toLowerCase()
      );
    });

    res.json({ person: person || null });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
