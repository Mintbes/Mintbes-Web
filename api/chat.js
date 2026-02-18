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
            return res.status(500).json({
                error: 'AI Configuration error',
                details: 'The server is missing the required API key.'
            });
        }

        // Using gemini-1.0-pro as it is the most stable and legacy-compatible model
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        // Simple system prompt
        const systemPrompt = `You are the Mintbes Validator AI assistant.
- You ONLY answer about Mintbes and Harmony ONE staking.
- Keep it very SHORT.
- Response in user's language.`;

        // Generate response
        const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error('Empty response from Gemini');

        return res.status(200).json({ response: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error cases with a version marker [v1.5]
        let errorMessage = 'Failed to get response from AI [v1.5]';
        if (error.message?.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API Key. [v1.5]';
        } else if (error.message?.includes('404')) {
            errorMessage = 'Model not found (404). [v1.5]';
        }

        return res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
}
