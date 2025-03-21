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
  
  // Add some debug logging
  console.log('Response from server:', response.data);
  
  return response.data;
};

export const chatWithProduct = async (chatHistory) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:8000/content/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(chatHistory)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
};