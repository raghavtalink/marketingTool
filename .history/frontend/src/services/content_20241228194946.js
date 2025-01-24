// src/services/content.js
import api from './api';

export const generateContent = async (product_id, prompt_type, sentiment) => {
  console.log('Generating content with:', { product_id, prompt_type, sentiment });
  const payload = {
    product_id,
    prompt_type,
    sentiment,
  };
  console.log('Request payload:', payload);
  const response = await api.post('/content/generate', payload);
  return response.data;
};

export const chatWithProduct = async (chatHistory) => {
  console.log('Chatting with product:', chatHistory);
  const response = await api.post('/content/chat', chatHistory);
  return response.data;
};