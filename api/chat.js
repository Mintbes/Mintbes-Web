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

        // Initialize Gemini with API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not defined in environment variables');
            return res.status(500).json({
                error: 'AI Configuration error',
                details: 'The server is missing the required API key. Please set GEMINI_API_KEY in environment variables.'
            });
        }

        // Use the most compatible version and model name
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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

**Substance (Facts about Mintbes):**
- Validator Name: Mintbes
- Validator Address: one12jell2lqaesqcye4qdp9cx8tzks4pega465r3k
- Current APR: ~12%.
- Identity: Committed to sustainability 🌿.

**Formatting:**
- Keep responses very SHORT and concise.
- Use **bold** for key terms.
- Use [Text](URL) format for links.`;

        // Direct generation to avoid chat session overhead/errors
        const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error('Empty response from Gemini');

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error cases with a version marker [v1.2]
        let errorMessage = 'Failed to get response from AI [v1.2]';
        if (error.message?.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API Key. [v1.2]';
        } else if (error.message?.includes('404')) {
            errorMessage = 'Model not found or API version error. [v1.2]';
        }

        return res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
}
