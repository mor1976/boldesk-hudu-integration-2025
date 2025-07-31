export default async function handler(req, res) {
  try {
    const HUDU_API_KEY = process.env.HUDU_API_KEY;
    const HUDU_SUBDOMAIN = process.env.HUDU_SUBDOMAIN;

    if (!HUDU_API_KEY || !HUDU_SUBDOMAIN) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        hasApiKey: !!HUDU_API_KEY,
        hasSubdomain: !!HUDU_SUBDOMAIN
      });
    }

    const HUDU_BASE_URL = `https://${HUDU_SUBDOMAIN}.huducloud.com/api/v1`;

    const response = await fetch(`${HUDU_BASE_URL}/asset_layouts`, {
      headers: {
        'x-api-key': HUDU_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Hudu API error: ${response.status}`);
    }

    const data = await response.json();
    
    const peopleLayout = data.asset_layouts.find(
      layout => layout.name.toLowerCase().includes('people')
    );

    res.json({
      success: true,
      totalLayouts: data.asset_layouts.length,
      peopleLayoutFound: !!peopleLayout,
      peopleLayout: peopleLayout ? {
        id: peopleLayout.id,
        name: peopleLayout.name
      } : null
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
}
