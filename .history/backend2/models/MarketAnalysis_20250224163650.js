const mongoose = require('mongoose');

const competitorDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  url: String,
  features: [String]
});

const marketAnalysisSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysisType: {
    type: String,
    required: true,
    enum: ['market_trends', 'pricing_strategy', 'bundle_recommendation']
  },
  content: {
    type: String,
    required: true
  },
  competitors: [competitorDataSchema],
  targetMargin: Number,
  marketDemand: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH']
  },
  season: {
    type: String,
    enum: ['CURRENT', 'SPRING', 'SUMMER', 'FALL', 'WINTER']
  },
  targetAudience: String,
  priceRange: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarketAnalysis', marketAnalysisSchema);