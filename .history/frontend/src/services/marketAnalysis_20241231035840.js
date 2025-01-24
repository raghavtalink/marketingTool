// src/services/marketAnalysis.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust if your backend port is different

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getDynamicPricing = async (productId, params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/pricing`, {
      product_id: productId,
      ...params
    });
    
    // Handle the text response and parse it manually
    if (typeof response.data === 'string') {
      const competitors = JSON.parse(
        response.data.substring(
          response.data.indexOf('['),
          response.data.lastIndexOf(']') + 1
        )
      );
      
      return {
        competitors,
        pricing_analysis: {
          min_price: Math.min(...competitors.map(c => c.price)),
          max_price: Math.max(...competitors.map(c => c.price)),
          recommendations: ['Competitive price analysis based on market data']
        }
      };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching dynamic pricing:', error);
    throw error;
  }
};

export const analyzeTrends = async (productId, trendType, timeframe) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/trends`, {
      product_id: productId,
      trend_type: trendType,
      timeframe: timeframe
    });
    
    // If response is empty or invalid, return default structure
    return {
      trends: response.data.trends || [],
      insights: response.data.insights || ['No market insights available']
    };
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw error;
  }
};

export const getBundleRecommendations = async (productIds, options) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/market/bundles`, {
      product_ids: productIds,
      ...options
    });
    
    // Ensure recommendations array exists
    return {
      recommendations: response.data.recommendations || []
    };
  } catch (error) {
    console.error('Error getting bundle recommendations:', error);
    throw error;
  }
};