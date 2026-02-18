
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

        // Gemini 2.0 Flash - Optimal Configuration [v2.5]
        const systemInstruction = {
            role: "system",
            parts: [{
                text: `You are the Mintbes Validator AI assistant for Harmony ONE.
**STRICT RULES:**
- Respond in the SAME LANGUAGE as the user (Spanish/English).
- Keep answers concise and professional.
- Use **bold** for key terms and [Text](URL) for links.

**MINTBES FACTS:**
- Name: Mintbes
- Address: one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- APR: ~12% (compounded)
- Fee: 0% (Limited time offer!)
- Identity: Sustainable and eco-friendly validator.
- Twitter: @MintbuilderES

**LINKS:**
- Staking: https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- Explorer: https://explorer.harmony.one/address/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k`
            }]
        };

        // Confirmed available via diagnostic list [v2.4]
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        const response = await fetch(
            `${baseUrl}?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: message }]
                        }
                    ],
                    system_instruction: systemInstruction,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response generated');

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('Gemini v2.5 Error:', error);
        return res.status(500).json({
            error: `AI Concierge temporarily unavailable [v2.5]`,
            details: error.message
        });
    }
}
