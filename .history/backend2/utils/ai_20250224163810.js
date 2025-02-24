const axios = require('axios');

const CLOUDFLARE_API_URL = process.env.CLOUDFLARE_API_URL;
const CLOUDFLARE_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

const googleSearch = async (query) => {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}`;
    const response = await axios.get(url);

    if (response.status !== 200) {
      console.error('Google API Error:', response.data);
      return '';
    }

    const results = response.data.items?.slice(0, 3).map(item => item.snippet) || [];
    const combinedText = results.join(' ');
    
    // Extract date using regex
    const dateMatch = combinedText.match(/\b(\d{1,2}\s\w+\s\d{4}|\w+\s\d{1,2},\s\d{4}|\d{4}-\d{2}-\d{2})\b/);
    const dateInfo = dateMatch ? dateMatch[0] : 'Date not found.';

    return `Latest Market Data (as of ${dateInfo}):\n\n${combinedText}`;
  } catch (error) {
    console.error('Error in googleSearch:', error);
    return '';
  }
};

const callLlama3 = async (prompt, structuredContext = '') => {
  try {
    const headers = {
      'Authorization': `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    };

    let userMessage = prompt;
    if (structuredContext) {
      userMessage += `\n\nWeb Data:\n${structuredContext}\n\nUse the above data to generate an answer.`;
    }

    const payload = {
      messages: [
        { role: 'system', content: 'You are an AI assistant with internet access. Use the provided data to answer queries accurately.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    };

    console.log('\n🚀 Sending request to Llama-3...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(CLOUDFLARE_API_URL, payload, { headers });
    return response.data?.result?.response || 'No response generated.';
  } catch (error) {
    console.error('Error in callLlama3:', error);
    throw new Error(`AI generation error: ${error.message}`);
  }
};

module.exports = {
  googleSearch,
  callLlama3
};