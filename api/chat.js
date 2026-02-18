import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize Gemini with API key and force stable v1 API version
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return res.status(500).json({
                error: 'AI Configuration error',
                details: 'The server is missing the required API key. Please set GEMINI_API_KEY in environment variables.'
            });
        }

        // We explicitly set the API version to 'v1' to avoid 404/v1beta issues
        const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1' });
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });

        // System prompt with Mintbes knowledge
        const systemPrompt = `You are the Mintbes Validator AI assistant for the Harmony ONE blockchain. 

**STRICT RULE: You ONLY answer questions about:**
- Mintbes Validator
- Harmony ONE blockchain
- Staking and delegation
- Cryptocurrency topics directly related to Harmony ONE

**If asked about ANYTHING else, politely decline and redirect to Harmony ONE topics.**

**Language Protocol:**
- Respond in the SAME language the user uses (English or Spanish).
- If the user writes in Spanish, provide technical terms in English where appropriate but explain in Spanish.

**Substance (Facts about Mintbes):**
- Validator Name: Mintbes
- Validator Address: one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- Current APR: ~12% (Varies with network conditions).
- Uptime: ~100% (High availability since the beginning).
- Commission: 5%.
- Ecosystem: Mintbes has been a validator since "Day One" of the Harmony mainnet.
- Identity: Committed to sustainability and transparency 🌿.
- Social: Very active on X (Twitter) @MintbuilderES.
- Community: Supports the ecosystem through promotion and education.

**Technical Harmony ONE Info:**
- Consensus: Effective Proof-of-Stake (EPoS).
- Speed: 2-second block finality.
- Sharding: 4 shards (Shard 0 is the beacon chain).
- Fees: Extremely low (usually < 0.001 ONE).

**How to Stake (Guide):**
1. Go to the [Harmony Staking Portal](https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k).
2. Connect your wallet (ONE Wallet browser extension or MetaMask).
3. Click "Delegate" on the Mintbes validator page.
4. Set the amount (Minimum 100 ONE).
5. Sign the transaction.

**Formatting Guidelines (Form):**
- **LENGTH: Keep responses very SHORT and concise.** Avoid long paragraphs.
- **NO INTROS: Do NOT introduce yourself or say "Hello! I'm..." in every message.** Respond directly to the user's question.
- Use **bold** for emphasis on key terms.
- Use lists for technical steps.
- ALWAYS use [Text](URL) format for links.
- Keep responses professional yet friendly 🌿.
- Use emojis like 🌿, 💎, 🚀 occasionally.

**Official Links:**
- Staking Portal: https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- Twitter (X): https://x.com/MintbuilderES
- Harmony Docs: https://docs.harmony.one/
- Mintbes Web: https://mintbes-web.vercel.app/

If the question is unrelated, respond with: "I'm specifically designed to help with Harmony ONE and Mintbes Validator questions. Please ask me about delegation, staking rewards, or the Harmony blockchain! 🌿" (or the Spanish equivalent).`;

        // Generate response using chat context for better handling
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am the Mintbes AI assistant. I will follow all instructions and only answer questions about Harmony ONE and Mintbes Validator in the requested format and language." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error cases
        let errorMessage = 'Failed to get response from AI';
        if (error.message?.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API Key. Please check your Gemini API key configuration.';
        } else if (error.message?.includes('safety')) {
            errorMessage = 'The response was blocked by safety filters. Please try rephrasing.';
        }

        return res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
}
