const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Product, AIResponse } = require('../models');
const axios = require('axios');

const CLOUDFLARE_API_URL = process.env.CLOUDFLARE_API_URL;
const CLOUDFLARE_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

const googleSearch = async (query) => {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_API_KEY}&cx=${CX}`;
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

    const response = await axios.post(CLOUDFLARE_API_URL, payload, { headers });
    return response.data?.result?.response || 'No response generated.';
  } catch (error) {
    console.error('Error in callLlama3:', error);
    throw new Error(`AI generation error: ${error.message}`);
  }
};

const contentResolver = {
  Query: {
    contentHistory: async (_, { productId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const product = await Product.findOne({ _id: productId, userId: user.id });
      if (!product) {
        throw new UserInputError('Product not found');
      }

      return await AIResponse.find({ productId }).sort({ generatedAt: -1 });
    },
  },

  Mutation: {
    generateContent: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const product = await Product.findOne({ 
        _id: input.productId, 
        userId: user.id 
      });

      if (!product) {
        throw new UserInputError('Product not found');
      }

      let webData = '';
      if (input.promptType === 'full_listing') {
        const searchQuery = `${product.name} ${new Date().getFullYear()} complete specifications features price comparison reviews`;
        webData = await googleSearch(searchQuery);
      }

      const aiPrompt = `
        You are an expert product marketer. Create content for the following product:
        
        Product Name: ${product.name}
        Category: ${product.category || 'N/A'}
        Description: ${product.description || 'N/A'}
        Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
        Content Type: ${input.promptType}
        Sentiment: ${input.sentiment || 'neutral'}
        
        ${webData ? `\nMarket Data:\n${webData}` : ''}
      `;

      const response = await callLlama3(aiPrompt, webData);

      const aiResponse = await AIResponse.create({
        content: response,
        contentType: input.promptType,
        productId: input.productId,
        generatedAt: new Date(),
        webDataUsed: !!webData
      });

      return aiResponse;
    },

    chat: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const product = await Product.findOne({ 
        _id: input.productId, 
        userId: user.id 
      });

      if (!product) {
        throw new UserInputError('Product not found');
      }

      const lastMessage = input.messages[input.messages.length - 1].message;
      let webData = '';

      if (input.searchWeb) {
        const searchQuery = `${product.name} ${lastMessage}`;
        webData = await googleSearch(searchQuery);
      }

      const conversation = `
        You are an AI assistant specializing in ${product.category || ''} products.
        
        Product Information:
        Name: ${product.name}
        Category: ${product.category || 'N/A'}
        Description: ${product.description || 'N/A'}
        Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
        
        User Query: ${lastMessage}
        ${webData ? `\nMarket Data:\n${webData}` : ''}
      `;

      const response = await callLlama3(conversation, webData);

      return {
        content: response,
        format: 'html',
        webDataUsed: !!webData
      };
    },

    deleteGeneratedContent: async (_, { contentId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const content = await AIResponse.findById(contentId);
      if (!content) {
        throw new UserInputError('Content not found');
      }

      const product = await Product.findOne({ 
        _id: content.productId, 
        userId: user.id 
      });

      if (!product) {
        throw new AuthenticationError('Not authorized to delete this content');
      }

      await AIResponse.findByIdAndDelete(contentId);
      return true;
    },
  },
};

module.exports = contentResolver;