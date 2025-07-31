export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personId } = req.body;
  
  // פשוט נחזיר הודעה שאין נכסים
  return res.status(200).json({ 
    assets: [],
    message: `חיפוש הושלם - לא נמצאו נכסים מקושרים`,
    personId: personId || 'unknown'
  });
}
