

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

        // Validate API Key format (Gemini keys usually start with AIza)
        if (!apiKey.startsWith('AIza')) {
            throw new Error(`API Key format invalid. It should start with 'AIza'. (Starts with: ${apiKey.substring(0, 4)}...)`);
        }

        // Trying gemini-pro (the most stable legacy name)
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const response = await fetch(
            `${baseUrl}?key=${apiKey}`,
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
            const diagUrl = `${baseUrl.split('/').slice(-2).join('/')}?key=***`;
            throw new Error(`${data.error?.message || response.statusText} [${diagUrl}]`);
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('API returned successfully but without candidate text.');
        }

        const text = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('Gemini Fetch Error:', error);
        return res.status(500).json({
            error: `Failed to get response [v1.11]`,
            details: error.message
        });
    }
}
