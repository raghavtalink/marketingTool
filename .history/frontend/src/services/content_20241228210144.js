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

export const chatWithProduct = async (chatHistory, onChunk) => {
    const response = await fetch('/content/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(chatHistory)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                onChunk(data);
            }
        }
    }
};