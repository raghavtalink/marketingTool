const mongoose = require('mongoose');

const aiResponseSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  webDataUsed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('AIResponse', aiResponseSchema);