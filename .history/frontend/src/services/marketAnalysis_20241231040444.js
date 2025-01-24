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
      
      // Extract competitors list from the raw text response
      if (response.data.pricing_strategy) {
        const competitorsMatch = response.data.pricing_strategy.match(/Here is the list of competitors[^[]*(\[[\s\S]*?\])/);
        let competitors = [];
        
        if (competitorsMatch && competitorsMatch[1]) {
          try {
            competitors = JSON.parse(competitorsMatch[1]);
          } catch (e) {
            console.error('Error parsing competitors:', e);
          }
        }
  
        // Extract price range from the pricing strategy text
        const priceRangeMatch = response.data.pricing_strategy.match(/optimal price range of (\d+) INR to (\d+) INR/);
        const minPrice = priceRangeMatch ? parseInt(priceRangeMatch[1]) : 0;
        const maxPrice = priceRangeMatch ? parseInt(priceRangeMatch[2]) : 0;
  
        // Extract recommendations from the pricing strategy
        const recommendations = response.data.pricing_strategy
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 5); // Take first 5 lines as recommendations
  
        return {
          competitors,
          pricing_analysis: {
            min_price: minPrice,
            max_price: maxPrice,
            recommendations
          }
        };
      }
      
      return {
        competitors: [],
        pricing_analysis: {
          min_price: 0,
          max_price: 0,
          recommendations: ['No pricing analysis available']
        }
      };
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