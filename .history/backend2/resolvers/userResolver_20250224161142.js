const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');

const userResolver = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return await User.findById(user.id);
    },
  },

  Mutation: {
    createUser: async (_, { input }) => {
      const { username, email, password } = input;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
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

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY,
        { algorithm: process.env.JWT_ALGORITHM, expiresIn: '5h' }
      );

      return {
        accessToken: token,
        tokenType: 'Bearer',
      };
    },
  },
};

module.exports = userResolver;