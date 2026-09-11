import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { query, geoState, agriState, lang } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured.' });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const isTa = lang === 'ta';
    
    const systemPrompt = `You are GeoCrop AI, an expert civil geotechnical and agricultural assistant.
    You must answer the user's queries accurately in ${isTa ? 'Tamil' : 'English'}.
    
    Current App State:
    - Geo: ${JSON.stringify(geoState)}
    - Agri: ${JSON.stringify(agriState)}
    
    Instructions:
    1. Answer the user's question naturally and expertly.
    2. If the user provides any soil or agricultural parameters in their text (e.g. pH 6, sand 40, cohesion 25, Gs 2.6, nitrogen 50, floors 3), extract them into the JSON output.
    3. If the user asks to navigate to a section (e.g., "go to geo", "show me agriculture", "generate report", "pdf"), identify the target tab as 'geo', 'agri', or 'report'.
    
    You MUST respond with a raw JSON object in this exact format (no markdown blocks like \`\`\`json):
    {
      "answer": "Your natural language response here...",
      "extractedParams": {
        "geo": { "gs": 2.6, "sandPct": 40 },
        "agri": { "soilPH": 6.5 }
      },
      "navigate": "geo" | "agri" | "report" | null
    }`;

    const result = await model.generateContent(systemPrompt + "\n\nUser Question: " + query);
    const text = result.response.text();
    
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    res.json(parsed);
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
