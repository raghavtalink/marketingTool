import api from './api';

export const analyzeTrends = async (productId, trendType, timeframe) => {
  const response = await api.post('/market/trends', {
    product_id: productId,
    trend_type: trendType,
    timeframe: timeframe
  });
  return response.data;
};

export const getDynamicPricing = async (productId, data) => {
  const response = await api.post('/market/pricing', {
    product_id: productId,
    ...data
  });
  return response.data;
};

export const getBundleRecommendations = async (productIds, options) => {
  const response = await api.post('/market/bundles', {
    product_ids: productIds,
    ...options
  });
  return response.data;
};