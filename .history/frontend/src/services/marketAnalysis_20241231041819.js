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
      
      // Parse competitors from the pricing strategy text
      const competitorSection = response.data.pricing_strategy.split('3. Detailed Competitor Pricing Strategies')[1]
        ?.split('4. Price Elasticity Analysis')[0];
      
      let competitors = [];
      if (competitorSection) {
        const competitorLines = competitorSection.split('\n').filter(line => line.includes(':'));
        competitors = competitorLines.map(line => {
          const [name, details] = line.split(':');
          const priceMatch = details.match(/\((\d+)\s*([A-Z]{3})\)/);
          const featuresMatch = details.match(/due to (.+?)(?=\.|$)/);
          
          return {
            name: name.trim(),
            price: priceMatch ? parseInt(priceMatch[1]) : 0,
            currency: priceMatch ? priceMatch[2] : 'USD',
            url: '(link unavailable)',
            features: featuresMatch ? 
              [featuresMatch[1].trim()] : 
              ['Premium features']
          };
        }).filter(comp => comp.price > 0);
      }
  
      // Extract price range from the pricing strategy text with currency
      const priceRangeMatch = response.data.pricing_strategy.match(/optimal price range of (\d+)\s*([A-Z]{3}) to (\d+)\s*([A-Z]{3})/);
      const minPrice = priceRangeMatch ? parseInt(priceRangeMatch[1]) : 0;
      const maxPrice = priceRangeMatch ? parseInt(priceRangeMatch[3]) : 0;
      const currency = priceRangeMatch ? priceRangeMatch[2] : 'USD';
  
      // Extract recommendations
      const recommendations = response.data.pricing_strategy
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5);
  
      return {
        competitors,
        pricing_analysis: {
          min_price: minPrice,
          max_price: maxPrice,
          currency: currency,
          recommendations
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