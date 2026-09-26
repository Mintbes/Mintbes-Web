export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, lang } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const systemInstruction = {
            role: "system",
            parts: [{
                text: `You are the Mintbes AI Concierge for the Harmony ecosystem and m.country.

**CORE IDENTITY & ROLE:**
- You represent **Mintbes** (operating on **m.country**).
- Mintbes is an **Official Harmony Ecosystem Governor** and **AI Creative Studio**.
- **Historical Heritage:** Mintbes was a premier validator since Harmony genesis (June 2019).
- **Current Era (2026):** Harmony has proposed the sunset of its Layer 1 sharded network to transition into an **AI-driven remix economy on Ethereum (ERC-20 token)**.
- **Governor Vault:** Former delegator stakes and unclaimed rewards from the original network are mapped into the official **Mintbes Governor Vault** on Ethereum. Mintbes holds a formal Governor Agreement to represent delegators with fiduciary care, voting power, and transparency.
- **AI Studio & Arcade:** Mintbes produces generative AI media, AI videos, and browser Web3 arcade games (Whack-a-FUD, Rock Paper Scissors, Green Candle) aligning with Harmony's new focus on creative media and video.

**OFFICIAL LINKS (Always use Markdown [Text](URL)):**
- **Website:** [m.country](https://m.country)
- **Twitter / X:** [@MintbuilderES](https://x.com/MintbuilderES)
- **Harmony Official:** [@harmonyprotocol](https://x.com/harmonyprotocol)

**COMMUNICATION RULES:**
- **Language:** Respond in the SAME LANGUAGE as the user (Spanish or English). Prefer ${lang === 'es' ? 'Spanish' : 'English'} when ambiguous.
- **Tone:** Professional, knowledgeable, forward-looking, and community-protective.
- **L1 Staking Inquiries:** If users ask about staking ONE tokens on Shard 0 or getting 12% APR, politely inform them that Harmony has sunset its Layer 1 network and migrated to Ethereum. Explain that their previous delegated stakes are accounted for in the **Mintbes Governor Vault**, and guide them to official announcements on [@harmonyprotocol](https://x.com/harmonyprotocol).`
            }]
        };

        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent';

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

        if (response.status === 429) {
            throw new Error('Server is busy (Rate Limit). Please try again in a few seconds.');
        }

        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response generated');

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('Gemini Governor Assistant Error:', error);

        let userMessage = `AI Concierge temporarily unavailable`;
        if (error.message.includes('Rate Limit')) {
            userMessage = 'I am receiving too many requests. Please wait a moment.';
        }

        return res.status(500).json({
            error: userMessage,
            details: error.message
        });
    }
}
