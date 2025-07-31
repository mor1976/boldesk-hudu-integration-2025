export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { personId } = req.body;
  if (!personId) {
    return res.status(400).json({ error: 'Person ID is required' });
  }

  try {
    // בינתיים נחזיר תשובה בסיסית
    res.json({ 
      assets: [
        {
          id: "123",
          name: "מחשב של רונית",
          asset_type: "Computer Asset",
          url: "https://get-mor.huducloud.com/a/assets/123"
        },
        {
          id: "456", 
          name: "Email 365 של רונית",
          asset_type: "Email",
          url: "https://get-mor.huducloud.com/a/assets/456"
        }
      ]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
