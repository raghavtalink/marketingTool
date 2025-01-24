import api from './api';

export const generateBackground = async (prompt) => {
    try {
        const response = await api.post('/image-editor/generate', { 
            prompt: prompt,
            steps: 4
        });
        
        if (!response.data || !response.data.image) {
            throw new Error('Invalid response format');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error generating background:', error);
        throw error;
    }
};

export const removeBackground = async (formData) => {
    try {
        const response = await api.post('/image-editor/remove-background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (!response.data || !response.data.image) {
            throw new Error('Invalid response format');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
};