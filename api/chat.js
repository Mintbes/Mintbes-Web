import { GoogleGenerativeAI } from '@google/generative-ai';

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

        // Initialize Gemini with API key from environment variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // System prompt with Mintbes knowledge
        const systemPrompt = `You are the Mintbes Validator AI assistant for the Harmony ONE blockchain. You help users understand:

**About Mintbes Validator:**
- Validator Name: Mintbes
- Validator Address: one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- Current APR: ~12%+ (varies with network conditions)
- Uptime: 99.9%+
- Commission Fee: 5%
- Staking Portal: https://staking.harmony.one/validators/mainnet/one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k

**About Harmony ONE:**
- Fast, secure, and scalable blockchain
- 2-second finality
- Low transaction fees
- Eco-friendly Proof-of-Stake consensus

**How to Delegate:**
1. Visit the staking portal
2. Connect your wallet (ONE Wallet, MetaMask, etc.)
3. Select Mintbes validator
4. Enter the amount of ONE tokens
5. Confirm the transaction

**Key Points:**
- Mintbes is committed to sustainability and community 🌿
- Active on X (Twitter) @MintbuilderES
- Supports the Harmony ecosystem through games and initiatives
- Rewards are automatically distributed
- No lock-up period, you can undelegate anytime (7-epoch waiting period)

**Important: Always respond in English.** Be concise, friendly, and helpful. Use emojis occasionally 🌿. If asked about topics unrelated to Mintbes, Harmony, or staking, politely redirect to these topics.`;

        // Combine system prompt with user message
        const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return res.status(500).json({
            error: 'Failed to get response from AI',
            details: error.message
        });
    }
}
