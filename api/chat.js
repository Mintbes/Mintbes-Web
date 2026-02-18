import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google-generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        // System prompt with full Mintbes knowledge
        const systemPrompt = `You are the Mintbes Validator assistant for Harmony ONE.
**Rules:** Respond in the user's language. Keep answers SHORT.
**Facts:** 
- Name: Mintbes
- Address: one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- APR: ~12%
- Uptime: ~100%
- Twitter: @MintbuilderES
**Links:** [Staking Portal](https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k)`;

        // Direct fetch to stable v1 endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:` }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `API Error ${response.status}`);
        }

        const text = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('Gemini Fetch Error:', error);
        return res.status(500).json({
            error: `Failed to get response [v1.6]`,
            details: error.message
        });
    }
}
