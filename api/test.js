import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    try {
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'GEMINI_API_KEY not configured',
                details: 'Environment variable is missing'
            });
        }

        // Try to initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Try a simple test
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ 
            status: 'OK',
            apiKeyConfigured: true,
            testResponse: text,
            message: 'API is working correctly'
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Test failed',
            details: error.message,
            stack: error.stack
        });
    }
}
