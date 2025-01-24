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
        
        // Clean up the response data if needed
        let imageData = response.data.image;
        if (typeof imageData === 'string') {
            // Remove any string formatting artifacts
            imageData = imageData.replace(/['"{}]/g, '');
            if (imageData.includes('image:')) {
                imageData = imageData.split('image:')[1].trim();
            }
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