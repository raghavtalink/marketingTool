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
        
        // Clean up the base64 string
        let imageData = response.data.image;
        
        // Ensure proper data URL formatting
        if (!imageData.startsWith('data:image')) {
            imageData = `data:image/png;base64,${imageData}`;
        }
        
        return { image: imageData };
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
            timeout: 30000, // 30 second timeout
        });
        return response.data;
    } catch (error) {
        console.error('Error removing background:', error);
        if (error.response) {
            throw new Error(error.response.data.detail || 'Failed to remove background');
        }
        throw new Error('Network error while removing background');
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