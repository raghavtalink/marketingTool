const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Product, MarketAnalysis } = require('../models');
const { googleSearch, callLlama3 } = require('../utils/ai');

const findCompetitors = async (product) => {
  const searchPrompt = `
    You are a market research expert with access to current internet data. 
    Search and analyze competitors for the following product:

    Product: ${product.name}
    Category: ${product.category || 'N/A'}
    Price Range: ${product.price || 'N/A'} ${product.currency || 'USD'}

    Instructions:
    1. Search the internet for top 5 direct competitors selling similar products
    2. Find their current market prices WITH THEIR ORIGINAL CURRENCIES
    3. Extract key product features
    4. Include product URLs when available

    Format your response EXACTLY as a JSON array with this structure:
    [
      {
        "name": "Competitor Product Name",
        "price": 99.99,
        "currency": "EUR",
        "url": "https://example.com/product",
        "features": ["Feature 1", "Feature 2"]
      }
    ]

    Ensure all prices are numbers (not strings), currencies are valid 3-letter codes (USD, EUR, GBP, etc), and URLs are valid.
  `;

  try {
    const webData = await googleSearch(`${product.name} competitors price comparison`);
    const response = await callLlama3(searchPrompt, webData);
    return JSON.parse(response.trim());
  } catch (error) {
    console.error('Error finding competitors:', error);
    return [];
  }
};

const marketAnalysisResolver = {
  Query: {
    marketAnalysisHistory: async (_, { analysisType }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const history = await MarketAnalysis.find({
        userId: user.id,
        analysisType
      })
      .sort({ generatedAt: -1 })
      .limit(10)
      .populate('productId');

      return history;
    }
  },

  Mutation: {
    analyzeTrends: async (_, { input }, { user }) => {
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

      const webData = await googleSearch(
        `${product.name} ${product.category} market trends ${input.timeframe} analysis`
      );

      const prompt = `
        You are a market research expert with real-time internet access. 
        Using current online market data, trends, and news sources, provide a comprehensive analysis.

        Product: ${product.name}
        Category: ${product.category || 'N/A'}
        Price Range: ${product.price || 'N/A'} ${product.currency || 'USD'}
        Timeframe: ${input.timeframe}

        Using real-time internet data, analyze and provide:
        1. Current market position and recent market changes
        2. Latest emerging trends (from the past 3 months)
        3. Recent consumer behavior shifts
        4. Updated market size data and growth forecasts
        5. Current market drivers and economic factors
        6. New market risks and challenges
        7. Fresh opportunities based on current data

        Important: Base your analysis on current online data and recent market developments. 
        Include relevant statistics and data points from reliable sources.
      `;

      const response = await callLlama3(prompt, webData);

      const analysis = await MarketAnalysis.create({
        productId: input.productId,
        userId: user.id,
        analysisType: 'market_trends',
        content: response,
        generatedAt: new Date()
      });

      return analysis;
    },

    suggestPricing: async (_, { input }, { user }) => {
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

      const competitors = await findCompetitors(product);

      const prompt = `
        You are a pricing strategy expert with access to current market data. 
        Using real-time internet data and market intelligence, provide a detailed pricing analysis.

        Product: ${product.name}
        Current Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
        Category: ${product.category || 'N/A'}
        Target Margin: ${input.targetMargin}%
        Market Demand: ${input.marketDemand}
        Season: ${input.season}

        Competitor Data:
        ${JSON.stringify(competitors, null, 2)}

        Using this data, provide:
        1. Optimal price range based on competitor analysis
        2. Current market price trends and forecasts
        3. Detailed competitor pricing strategies
        4. Price elasticity analysis
        5. Seasonal pricing recommendations
        6. Risk assessment
        7. Promotional pricing opportunities

        Note: Include currency conversion rates where applicable for accurate comparison.
      `;

      const webData = await googleSearch(
        `${product.name} ${product.category} pricing strategy market analysis`
      );
      const response = await callLlama3(prompt, webData);

      const analysis = await MarketAnalysis.create({
        productId: input.productId,
        userId: user.id,
        analysisType: 'pricing_strategy',
        content: response,
        competitors,
        targetMargin: input.targetMargin,
        marketDemand: input.marketDemand,
        season: input.season,
        generatedAt: new Date()
      });

      return analysis;
    },

    recommendBundles: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const products = await Product.find({
        _id: { $in: input.productIds },
        userId: user.id
      });

      if (products.length !== input.productIds.length) {
        throw new UserInputError('One or more products not found or not owned by user');
      }

      const productList = products.map(p => 
        `- ${p.name}: ${p.price || 'N/A'} ${p.currency || 'USD'}`
      ).join('\n');

      const webData = await googleSearch(
        `${products.map(p => p.name).join(' ')} bundle marketing strategy ${input.targetAudience}`
      );

      const prompt = `
        You are a product bundling strategist with access to current market data. 
        Using real-time internet data and consumer trends, analyze and recommend optimal bundles.

        Products to analyze:
        ${productList}

        Target Audience: ${input.targetAudience}
        Price Range: ${input.priceRange}
        Season: ${input.season}

        Using current market data, provide:
        1. Recommended bundle combinations based on current trends
        2. Bundle pricing strategy using market benchmarks
        3. Current market synergy opportunities
        4. Trending marketing angles and themes
        5. Success probability based on current market data
        6. Target demographic insights from recent studies
        7. Seasonal timing recommendations
        8. Competitive bundle analysis

        Important: Base recommendations on current market trends, consumer behavior data, 
        and successful bundle examples from the market. Include relevant statistics and benchmarks.
      `;

      const response = await callLlama3(prompt, webData);

      const analysis = await MarketAnalysis.create({
        productIds: input.productIds,  // Keep this as is
        userId: user.id,
        analysisType: 'bundle_recommendation',
        content: response,
        targetAudience: input.targetAudience,
        priceRange: input.priceRange,
        season: input.season,
        generatedAt: new Date()
      });

      return {
        ...analysis.toObject(),
        id: analysis._id,  // Ensure ID is properly mapped
        productIds: analysis.productIds  // Return productIds instead of productId
        
    }
  }
};

module.exports = marketAnalysisResolver;