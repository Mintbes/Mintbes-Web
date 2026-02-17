// Test script for Gemini API
// Run with: node test-gemini-api.js YOUR_API_KEY_HERE

const apiKey = process.argv[2];

if (!apiKey) {
    console.error('❌ Error: Please provide your API key');
    console.log('Usage: node test-gemini-api.js YOUR_API_KEY');
    process.exit(1);
}

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API...\n');

    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + apiKey,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Say hello in one word'
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', response.status);
            console.error('Details:', JSON.stringify(data, null, 2));

            if (response.status === 400) {
                console.log('\n💡 Possible issues:');
                console.log('   - API key might not be valid');
                console.log('   - You may need to enable the Generative Language API');
                console.log('   - Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
            }
            return;
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        console.log('✅ Success! API is working');
        console.log('📝 Response:', textResponse);
        console.log('\n✨ Your API key is valid and working!');
        console.log('You can now use it in Vercel.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testGeminiAPI();
