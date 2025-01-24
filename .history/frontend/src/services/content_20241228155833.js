// src/services/content.js
import api from './api';

export const generateContent = async (product_id, prompt_type) => {
  const response = await api.post('/content/generate', {
    product_id,
    prompt_type,
  });
  return response.data;
};