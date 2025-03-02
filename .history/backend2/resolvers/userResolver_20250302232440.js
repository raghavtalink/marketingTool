const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User, Product, AIResponse, MarketAnalysis, ImageEditorProject } = require('../models');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');

const userResolver = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return user;
    },
    
    userStats: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      
      // Get counts from various collections
      const productsCount = await Product.countDocuments({ userId: user.id });
      const chatsCount = await AIResponse.countDocuments({ 
        contentType: 'chat', 
        productId: { $in: await Product.find({ userId: user.id }).distinct('_id') }
      });
      const marketAnalysesCount = await MarketAnalysis.countDocuments({ userId: user.id });
      const imageProjectsCount = await ImageEditorProject.countDocuments({ userId: user.id });
      
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        productsCount,
        chatsCount,
        marketAnalysesCount,
        imageProjectsCount,
        totalGeneratedContent: chatsCount + marketAnalysesCount + imageProjectsCount,
        memberSince: user.createdAt
      };
    },
    
    userActivity: async (_, { limit = 10 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      
      // Get recent products
      const products = await Product.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      const productIds = products.map(p => p._id);
      
      // Get recent chats/content
      const aiResponses = await AIResponse.find({ 
        productId: { $in: productIds } 
      })
        .sort({ generatedAt: -1 })
        .limit(limit)
        .lean();
      
      // Get recent market analyses
      const marketAnalyses = await MarketAnalysis.find({ userId: user.id })
        .sort({ generatedAt: -1 })
        .limit(limit)
        .lean();
      
      // Get recent image projects
      const imageProjects = await ImageEditorProject.find({ userId: user.id })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
      
      // Combine all activities into one array with type indicators
      const activities = [
        ...products.map(p => ({
          type: 'PRODUCT_CREATED',
          description: `Created product: ${p.name}`,
          timestamp: p.createdAt,
          entityId: p._id,
          entityType: 'Product'
        })),
        
        ...aiResponses.map(a => ({
          type: 'CONTENT_GENERATED',
          description: `Generated ${a.contentType} for product`,
          timestamp: a.generatedAt,
          entityId: a._id,
          entityType: 'AIResponse',
          productId: a.productId
        })),
        
        ...marketAnalyses.map(m => ({
          type: 'MARKET_ANALYSIS',
          description: `Performed ${m.analysisType.replace('_', ' ')}`,
          timestamp: m.generatedAt,
          entityId: m._id,
          entityType: 'MarketAnalysis',
          productId: m.productId
        })),
        
        ...imageProjects.map(i => ({
          type: 'IMAGE_EDITED',
          description: 'Updated image project',
          timestamp: i.updatedAt,
          entityId: i._id,
          entityType: 'ImageEditorProject',
          productId: i.productId
        }))
      ];
      
      // Sort activities by timestamp (most recent first) and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    },
    
    userContentBreakdown: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      
      // Get content type breakdown
      const contentTypes = await AIResponse.aggregate([
        { $match: { productId: { $in: await Product.find({ userId: user.id }).distinct('_id') } } },
        { $group: { _id: "$contentType", count: { $sum: 1 } } }
      ]);
      
      // Get market analysis type breakdown
      const analysisTypes = await MarketAnalysis.aggregate([
        { $match: { userId: user.id } },
        { $group: { _id: "$analysisType", count: { $sum: 1 } } }
      ]);
      
      return {
        contentTypeBreakdown: contentTypes.map(type => ({
          type: type._id,
          count: type.count
        })),
        marketAnalysisBreakdown: analysisTypes.map(type => ({
          type: type._id,
          count: type.count
        }))
      };
    }
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