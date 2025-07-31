export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Get environment variables
    const HUDU_API_KEY = process.env.HUDU_API_KEY;
    const HUDU_SUBDOMAIN = process.env.HUDU_SUBDOMAIN;

    if (!HUDU_API_KEY || !HUDU_SUBDOMAIN) {
      return res.status(500).json({ error: 'Missing Hudu configuration' });
    }

    const HUDU_BASE_URL = `https://${HUDU_SUBDOMAIN}.huducloud.com/api/v1`;

    // Step 1: Get People asset layout
    const layoutsResponse = await fetch(`${HUDU_BASE_URL}/asset_layouts`, {
      headers: {
        'x-api-key': HUDU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!layoutsResponse.ok) {
      throw new Error(`Hudu API error: ${layoutsResponse.status}`);
    }

    const layoutsData = await layoutsResponse.json();
    const peopleLayout = layoutsData.asset_layouts.find(
      layout => layout.name.toLowerCase().includes('people')
    );

    if (!peopleLayout) {
      return res.status(404).json({ error: 'People asset layout not found' });
    }

    // Step 2: Search for person by email
    const assetsResponse = await fetch(`${HUDU_BASE_URL}/assets?asset_layout_id=${peopleLayout.id}&search=${encodeURIComponent(email)}`, {
      headers: {
        'x-api-key': HUDU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!assetsResponse.ok) {
      throw new Error(`Hudu assets API error: ${assetsResponse.status}`);
    }

    const assetsData = await assetsResponse.json();

    // Find person with matching email
    const person = assetsData.assets?.find(asset => {
      return asset.fields?.some(field => 
        field.value && field.value.toLowerCase() === email.toLowerCase()
      );
    });

    res.json({ 
      person: person || null,
      peopleLayoutId: peopleLayout.id 
    });

  } catch (error) {
    console.error('Error searching person:', error);
    res.status(500).json({ error: error.message });
  }
}
