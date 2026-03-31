export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY not configured' });
    }

    // Google Gemini REST API setup
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error communicating with Gemini');
    }

    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const narratives = JSON.parse(textOutput);

    return res.status(200).json({ success: true, narratives });
  } catch (error) {
    console.error('Error in /generate-narratives:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
