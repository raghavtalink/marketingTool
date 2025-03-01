const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Product } = require('../models');
const { scrapeProduct } = require('../utils/productScraper');


const productResolver = {
  Query: {
    products: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return await Product.find({ userId: user.id });
    },

    product: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      const product = await Product.findOne({ _id: id, userId: user.id });
      if (!product) {
        throw new UserInputError('Product not found');
      }
      return product;
    },
  },

  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const product = await Product.create({
        ...input,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return product;
    },
    importScrapedProduct: async (_, { url }, { user }) => {
      console.log(`[Mutation:importScrapedProduct] Starting for URL: ${url}`);
      
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      
      try {
        const productData = await scrapeProduct(url);
        console.log(`[importScrapedProduct] Successfully scraped data from: ${url}`);
        
        // Extract price as a number
        let price = 0;
        if (productData.price) {
          // Remove currency symbols and non-numeric characters except decimal point
          const priceString = productData.price.replace(/[^0-9.]/g, '');
          price = parseFloat(priceString) || 0;
        }
        
        // Extract currency symbol if present
        let currency = 'USD';
        if (productData.price) {
          const currencyMatch = productData.price.match(/[$€£₹]/);
          if (currencyMatch) {
            const symbol = currencyMatch[0];
            // Map symbols to currency codes
            const currencyMap = {
              '$': 'USD',
              '€': 'EUR',
              '£': 'GBP',
              '₹': 'INR'
            };
            currency = currencyMap[symbol] || 'USD';
          }
        }
        
        // Create a new product with the scraped data
        const newProduct = await Product.create({
          name: productData.title || 'Untitled Product',
          description: productData.description || '',
          category: productData.category || 'Other',
          price: price,
          currency: currency,
          competitorUrls: [url],
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        return newProduct;
      } catch (error) {
        console.error(`[importScrapedProduct] Error:`, error);
        throw new Error(`Failed to import product: ${error.message}`);
      }
    },
  },
};

module.exports = productResolver;