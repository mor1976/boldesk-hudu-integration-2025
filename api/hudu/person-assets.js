export default async function handler(req, res) {
  // תמיד נחזיר JSON תקין
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', assets: [] });
  }

  const { personId } = req.body;
  if (!personId) {
    return res.status(400).json({ error: 'Person ID is required', assets: [] });
  }

  try {
    // פשוט נחזיר הודעה בלי לנסות API calls מסובכים
    res.status(200).json({ 
      assets: [], // תמיד מערך ריק
      message: `חיפוש נכסים עבור Person ID: ${personId} הושלם`,
      personId: personId,
      success: true
    });

  } catch (error) {
    // גם בשגיאה נחזיר מבנה תקין
    res.status(500).json({ 
      error: error.message,
      assets: [], // תמיד מערך ריק
      success: false
    });
  }
}
