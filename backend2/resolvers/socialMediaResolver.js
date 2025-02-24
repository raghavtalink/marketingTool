const mongoose = require('mongoose');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Product, SocialMediaCampaign } = require('../models');
const { callLlama3, googleSearch } = require('../utils/ai');

const contentPlanSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN']
  },
  content: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

const socialMediaCampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  campaignName: {
    type: String,
    required: true
  },
  platforms: [{
    type: String,
    enum: ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN']
  }],
  objectives: [{
    type: String,
    enum: ['AWARENESS', 'ENGAGEMENT', 'SALES', 'TRAFFIC']
  }],
  contentPlan: [contentPlanSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'],
    default: 'DRAFT'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const socialMediaResolver = {
  Query: {
    campaigns: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      return await SocialMediaCampaign.find({ userId: user.id })
        .sort({ createdAt: -1 });
    },

    campaign: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }
      const campaign = await SocialMediaCampaign.findOne({
        _id: id,
        userId: user.id
      });
      if (!campaign) {
        throw new UserInputError('Campaign not found');
      }
      return campaign;
    }
  },

  Mutation: {
    createCampaign: async (_, { input }, { user }) => {
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
        `${product.name} ${product.category} social media marketing trends`
      );

      const platformPrompts = {
        facebook: "Create engaging Facebook post content with compelling call-to-action",
        instagram: "Design visually appealing Instagram caption with relevant hashtags",
        twitter: "Write concise Twitter post optimized for engagement",
        linkedin: "Develop professional LinkedIn content focusing on business value"
      };

      const contentPlans = await Promise.all(
        input.platforms.map(async platform => {
          const prompt = `
            You are a social media marketing expert. Create content for ${platform}.
            
            Product Details:
            Name: ${product.name}
            Category: ${product.category || 'N/A'}
            Description: ${product.description || 'N/A'}
            Price: ${product.price || 'N/A'} ${product.currency || 'USD'}
            
            Campaign Objectives: ${input.objectives.join(', ')}
            Platform: ${platform}
            
            ${platformPrompts[platform.toLowerCase()]}
            
            Include:
            1. Post content/caption
            2. Hashtags (if applicable)
            3. Call to action
            4. Best posting time recommendation
            5. Content type (image, video, carousel, etc.)
            6. Engagement strategy
          `;

          const response = await callLlama3(prompt, webData);
          return {
            platform,
            content: response
          };
        })
      );

      const campaign = await SocialMediaCampaign.create({
        userId: user.id,
        productId: input.productId,
        campaignName: input.campaignName,
        platforms: input.platforms,
        objectives: input.objectives,
        contentPlan: contentPlans,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return campaign;
    },

    updateCampaign: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const campaign = await SocialMediaCampaign.findOne({
        _id: id,
        userId: user.id
      });

      if (!campaign) {
        throw new UserInputError('Campaign not found');
      }

      const updatedCampaign = await SocialMediaCampaign.findByIdAndUpdate(
        id,
        {
          ...input,
          updatedAt: new Date()
        },
        { new: true }
      );

      return updatedCampaign;
    },

    deleteCampaign: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const campaign = await SocialMediaCampaign.findOne({
        _id: id,
        userId: user.id
      });

      if (!campaign) {
        throw new UserInputError('Campaign not found');
      }

      await SocialMediaCampaign.findByIdAndDelete(id);
      return true;
    },

    generateCampaignContent: async (_, { campaignId, platform }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const campaign = await SocialMediaCampaign.findOne({
        _id: campaignId,
        userId: user.id
      }).populate('productId');

      if (!campaign) {
        throw new UserInputError('Campaign not found');
      }

      const webData = await googleSearch(
        `${campaign.productId.name} ${platform} marketing trends`
      );

      const prompt = `
        You are a social media marketing expert. Generate fresh content for ${platform}.
        
        Product: ${campaign.productId.name}
        Category: ${campaign.productId.category || 'N/A'}
        Campaign Name: ${campaign.campaignName}
        Objectives: ${campaign.objectives.join(', ')}
        
        Create:
        1. Engaging post content
        2. Relevant hashtags
        3. Call-to-action
        4. Posting time recommendation
        5. Content type suggestion
      `;

      const response = await callLlama3(prompt, webData);

      return {
        platform,
        content: response,
        generatedAt: new Date()
      };
    }
  }
};

module.exports = socialMediaResolver;