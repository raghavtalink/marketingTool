// src/services/marketAnalysis.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/a'; // Replace with your actual API base URL

// Fetch all products
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch dynamic pricing data
export const getDynamicPricing = async (productId, data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/pricing`, {
      product_id: productId,
      target_margin: data.target_margin,
      competitor_prices: data.competitor_prices,
      market_demand: data.market_demand,
      season: data.season
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dynamic pricing:', error);
    throw error;
  }
};

// Analyze market trends
export const analyzeTrends = async (productId, trendType, timeframe) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/trends`, {
      product_id: productId,
      trend_type: trendType,
      timeframe: timeframe
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw error;
  }
};

// Get bundle recommendations
export const getBundleRecommendations = async (productIds, options) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/bundles`, {
      product_ids: productIds,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error getting bundle recommendations:', error);
    throw error;
  }
};