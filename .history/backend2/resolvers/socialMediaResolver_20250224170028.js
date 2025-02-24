const mongoose = require('mongoose');

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

module.exports = mongoose.model('SocialMediaCampaign', socialMediaCampaignSchema);