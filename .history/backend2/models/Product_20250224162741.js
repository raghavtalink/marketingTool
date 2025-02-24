const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: String,
  price: Number,
  inventoryCount: Number,
  competitorUrls: [String],
  currency: {
    type: String,
    default: 'USD',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Product', productSchema);