const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User } = require('../models');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');

const userResolver = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return user;
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { email, password, username } = input;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError('Email already registered');
      }

      // Create user without hashing password to match Python backend
      const user = await User.create({
        email,
        username,
        password, // Store password directly to match Python backend
      });

      return user;
    },

    login: async (_, { input }) => {
      const { email, password } = input;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Compare passwords directly since Python backend stored them directly
      if (password !== user.password) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate token
      const token = generateToken(user._id);

      return {
        accessToken: token,
        tokenType: 'Bearer',
      };
    },
  },
};

module.exports = userResolver;