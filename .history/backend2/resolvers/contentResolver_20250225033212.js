const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Product, AIResponse } = require('../models');
const axios = require('axios');
import {googleSearch} from '../utils/googleSearch';

const CLOUDFLARE_API_URL = process.env.CLOUDFLARE_API_URL;
const CLOUDFLARE_AUTH_TOKEN = process.env.CLOUDFLARE_AUTH_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

// const googleSearch = async (query) => {
//   try {
//     const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_API_KEY}&cx=${CX}`;
//     const response = await axios.get(url);

//     if (response.status !== 200) {
//       console.error('Google API Error:', response.data);
//       return '';
//     }

//     const results = response.data.items?.slice(0, 3).map(item => item.snippet) || [];
//     const combinedText = results.join(' ');
    
//     // Extract date using regex
//     const dateMatch = combinedText.match(/\b(\d{1,2}\s\w+\s\d{4}|\w+\s\d{1,2},\s\d{4}|\d{4}-\d{2}-\d{2})\b/);
//     const dateInfo = dateMatch ? dateMatch[0] : 'Date not found.';

//     return `Latest Market Data (as of ${dateInfo}):\n\n${combinedText}`;
//   } catch (error) {
//     console.error('Error in googleSearch:', error);
//     return '';
//   }
// };

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
        return await AIResponse.find({ productId }).sort({ generatedAt: -1 });
      },
    },

  Mutation: {
    generateTitle: async (_, { input }, { user }) => {
        if (!user) throw new AuthenticationError('Not authenticated');
        
        const product = await Product.findOne({ _id: input.productId, userId: user.id });
        if (!product) throw new UserInputError('Product not found');
  
        const webData = await googleSearch(`${product.name} ${product.category} title examples marketplace`);
        
        const aiPrompt = `
          You are an expert in SEO and product titles. Create a compelling, SEO-optimized title for:
          
          Product Name: ${product.name}
          Category: ${product.category || 'N/A'}
          Description: ${product.description || 'N/A'}
          Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
  
          Format your response in HTML using these guidelines:
          - Use <h3> for section headings
          - Use <ul> or <ol> for lists
          - Use <p> for paragraphs
          - Use <strong> for emphasis
          - Use <br> for line breaks
          - Use <div class="highlight"> for important information
          Keep the HTML simple and semantic.
          
          Requirements:
          - Keep under 70 characters
          - Include main keywords
          - Be compelling and clickable
          - Match marketplace best practices
          
          ${webData ? `\nMarket Research:\n${webData}` : ''}
        `;
  
        const response = await callLlama3(aiPrompt, webData);
        
        return await AIResponse.create({
          content: response,
          contentType: 'title',
          productId: input.productId,
          generatedAt: new Date(),
          webDataUsed: !!webData
        });
      },
  
      generateSEOTags: async (_, { input }, { user }) => {
        if (!user) throw new AuthenticationError('Not authenticated');
        
        const product = await Product.findOne({ _id: input.productId, userId: user.id });
        if (!product) throw new UserInputError('Product not found');
  
        let webData = '';
        try {
          webData = await googleSearch(`${product.name} ${product.category} SEO keywords meta tags`);
        } catch (error) {
          console.log('Skipping web data due to error:', error.message);
        }
        
        const aiPrompt = `
          Generate SEO metadata for this product:
          
          Product Name: ${product.name}
          Category: ${product.category || 'N/A'}
          Description: ${product.description || 'N/A'}
  
          Format your response in HTML using these guidelines:
          - Use <h3> for section headings
          - Use <ul> or <ol> for lists
          - Use <p> for paragraphs
          - Use <strong> for emphasis
          - Use <br> for line breaks
          - Use <div class="highlight"> for important information
          Keep the HTML simple and semantic.
          
          Provide:
          1. Meta description (160 characters max)
          2. Focus keywords (5-7 keywords)
          3. Secondary keywords (3-5 keywords)
          4. Suggested hashtags
          
          ${webData ? `\nMarket Research:\n${webData}` : ''}
        `;
  
        const response = await callLlama3(aiPrompt, webData);
        
        return await AIResponse.create({
          content: response,
          contentType: 'seo_tags',
          productId: input.productId,
          generatedAt: new Date(),
          webDataUsed: !!webData
        });
      },
  
      generateFullListing: async (_, { input }, { user }) => {
        if (!user) throw new AuthenticationError('Not authenticated');
        
        const product = await Product.findOne({ _id: input.productId, userId: user.id });
        if (!product) throw new UserInputError('Product not found');

        let webData = '';
        try {
          webData = await googleSearch(`${product.name} ${new Date().getFullYear()} complete specifications features reviews`);
        } catch (error) {
          console.log('Skipping web data due to error:', error.message);
        }
        
        const aiPrompt = `
          Create a complete product listing with HTML formatting:
          
          Product Name: ${product.name}
          Category: ${product.category || 'N/A'}
          Description: ${product.description || 'N/A'}
          Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
          
          Format your response in HTML using these guidelines:
          - Use <h3> for section headings
          - Use <ul> or <ol> for lists
          - Use <p> for paragraphs
          - Use <strong> for emphasis
          - Use <br> for line breaks
          - Use <div class="highlight"> for important information
          Keep the HTML simple and semantic.
          
          Include:
          1. Product Overview
          2. Key Features
          3. Technical Specifications
          4. Benefits
          5. Use Cases
          6. Warranty/Support Info
          
          ${webData ? `\nMarket Research:\n${webData}` : ''}
        `;
  
        const response = await callLlama3(aiPrompt, webData);
        
        return await AIResponse.create({
          content: response,
          contentType: 'full_listing',
          productId: input.productId,
          generatedAt: new Date(),
          webDataUsed: !!webData
        });
      },
  
      deleteGeneratedContent: async (_, { contentId }, { user }) => {
        if (!user) throw new AuthenticationError('Not authenticated');
  
        const content = await AIResponse.findById(contentId);
        if (!content) throw new UserInputError('Content not found');
  
        const product = await Product.findOne({ _id: content.productId, userId: user.id });
        if (!product) throw new AuthenticationError('Not authorized to delete this content');
  
        await AIResponse.findByIdAndDelete(contentId);
        return true;
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