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
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:8000/content/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`,
            'Access-Control-Allow-Credentials': 'true'
        },
        credentials: 'include',
        body: JSON.stringify(chatHistory)
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';
        
        for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    onChunk(data);
                } catch (e) {
                    console.error('Error parsing SSE data:', e);
                }
            }
        }
    }
};