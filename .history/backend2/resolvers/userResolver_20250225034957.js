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

      console.log('New User created:', user);

      return user;
    },

    login: async (_, { input }) => {
        const { email, password } = input;
      
        // Debug log
        console.log('Login attempt:', { email, password });
      
        // Find user
        const user = await User.findOne({ email });
        console.log('Found user:', user);
      
        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }
      
        // Debug password comparison
        console.log('Comparing passwords:', {
          input: password,
          stored: user.password
        });
      
        if (password !== user.password) {
          throw new AuthenticationError('Invalid credentials');
        }
      
        const token = generateToken(user._id);
        return {
          accessToken: token,
          tokenType: 'Bearer',
        };
      },
  },
};

module.exports = userResolver;