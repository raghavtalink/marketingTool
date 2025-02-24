const axios = require('axios');

const googleSearch = async (query) => {
  try {
    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CX) {
      console.log('Google Search API not configured, skipping web data');
      return '';
    }

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_CX,
        q: query,
        num: 5 // Number of results
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return '';
    }

    // Extract snippets from search results
    const snippets = response.data.items
      .map(item => item.snippet)
      .filter(Boolean)
      .join('\n');

    return snippets;
  } catch (error) {
    console.error('Google Search API error:', error.message);
    // Don't throw error, just return empty string to continue without web data
    return '';
  }
};

module.exports = googleSearch;