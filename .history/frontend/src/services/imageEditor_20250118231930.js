import api from './api';

export const generateBackground = async (prompt) => {
    try {
        console.log('Sending request with prompt:', prompt); // Debug log
        
        const response = await api.post('/image-editor/generate', { 
            prompt: prompt,
            steps: 4
        });
        
        console.log('Received response:', response.data); // Debug log
        
        if (!response.data || !response.data.image) {
            console.error('Invalid response format:', response.data); // Debug log
            throw new Error('Invalid response format');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error generating background:', error);
        if (error.response) {
            console.error('Error response:', error.response.data); // Debug log
            throw new Error(error.response.data.detail || 'Failed to generate image');
        }
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

export const harmonizeImages = async (imageData) => {
    try {
        const response = await api.post('/image-editor/harmonize', {
            background_image: imageData.background.split(',')[1], // Remove data:image/png;base64, prefix
            product_image: imageData.product.split(',')[1],
        });

        if (!response.data || !response.data.image) {
            throw new Error('Invalid response format');
        }

        return response.data;
    } catch (error) {
        console.error('Error harmonizing images:', error);
        throw error;
    }
};