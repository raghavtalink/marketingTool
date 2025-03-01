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
  },
};

module.exports = productResolver;