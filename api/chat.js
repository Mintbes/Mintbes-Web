
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

        // Gemini 2.0 Flash Lite - Content Verified & Clickable Links [v2.7]
        const systemInstruction = {
            role: "system",
            parts: [{
                text: `You are the Mintbes Validator AI assistant for Harmony ONE.

**CORE IDENTITY:**
- You represent the **Mintbes Validator**.
- **User Verified Source:** https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- **Language:** Respond in the SAME LANGUAGE as the user (Spanish/English).
- **Tone:** Professional, concise, and helpful.

**OFFICIAL LINKS (Always use Markdown for clickability):**
- **Staking Dashboard:** [staking.harmony.one/mintbes](https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k)
- **Explorer:** [explorer.harmony.one/mintbes](https://explorer.harmony.one/address/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k)
- **Twitter:** [@MintbuilderES](https://twitter.com/MintbuilderES)

**VALIDATOR KEY FACTS:**
- **Name:** Mintbes
- **Address:** \`one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k\`
- **Fee:** **0%** (Check dashboard for updates)
- **APR:** Dynamic (approx. 9-12% - Verify on dashboard)
- **Focus:** Sustainable, eco-friendly, and community-driven.

**INSTRUCTIONS:**
- Always format links as \`[Link Text](URL)\`.
- If asked about real-time stats (APR, Total Stake), providing the estimate is fine but ALWAYS refer the user to the [Staking Dashboard](https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k) for the exact current number.`
            }]
        };

        // Switching to valid "Lite" model to avoid "Resource exhausted" errors
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

        // Specific handling for Rate Limits (429)
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
        console.error('Gemini v2.6 Error:', error);

        // Return a cleaner error message to the UI
        let userMessage = `AI Concierge temporarily unavailable [v2.6]`;
        if (error.message.includes('Rate Limit')) {
            userMessage = 'I am receiving too many requests. Please wait a moment.';
        }

        return res.status(500).json({
            error: userMessage,
            details: error.message
        });
    }
}
