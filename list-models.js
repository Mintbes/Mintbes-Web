// list-models.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.argv[2] || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Error: Please provide your API key');
    process.exit(1);
}

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the internal fetch method to list models specifically
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error.message);
            return;
        }

        console.log('✅ Available Models:');
        data.models.forEach(model => {
            console.log(`- ${model.name} (${model.displayName})`);
            console.log(`  Supported Generation Methods: ${model.supportedGenerationMethods.join(', ')}`);
        });
    } catch (error) {
        console.error('❌ Failed to list models:', error.message);
    }
}

listModels();
