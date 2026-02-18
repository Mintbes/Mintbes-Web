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

        // We use the full model path 'models/gemini-1.5-flash' and force the 'v1' stable API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel(
            { model: "models/gemini-1.5-flash" },
            { apiVersion: 'v1' }
        );

        // Simple system prompt
        const systemPrompt = `You are the Mintbes Validator AI assistant for Harmony ONE.
- You ONLY answer about Mintbes and Harmony ONE staking.
- Keep it very SHORT.
- Use **bold** for keys.
- Response in user's language.`;

        // Direct generation to avoid chat session overhead/errors
        const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error('Empty response from Gemini');

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error cases with a version marker [v1.4]
        let errorMessage = 'Failed to get response from AI [v1.4]';
        if (error.message?.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API Key. [v1.4]';
        } else if (error.message?.includes('404')) {
            errorMessage = 'Model or Path not found (404). [v1.4]';
        }

        return res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
}
