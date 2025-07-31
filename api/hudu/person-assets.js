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

    // Get the specific person's details
    const personResponse = await fetch(`${HUDU_BASE_URL}/assets/${personId}`, {
      headers: { 'x-api-key': HUDU_API_KEY }
    });

    if (!personResponse.ok) {
      return res.status(500).json({ 
        error: `Person API failed: ${personResponse.status}`,
        personId: personId 
      });
    }

    const personData = await personResponse.json();
    
    // Return debug info to see the structure
    res.json({ 
      debug: true,
      personId: personId,
      personName: personData.asset?.name,
      fullResponse: personData,
      hasRelatedItems: !!personData.asset?.related_items,
      relatedItemsCount: personData.asset?.related_items?.length || 0
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      personId: personId 
    });
  }
}
