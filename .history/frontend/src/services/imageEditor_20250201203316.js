import api from './api';

export const generateBackground = async (prompt) => {
    try {
        const response = await api.post('/image-editor/generate', { 
            prompt: prompt,
            steps: 8,
            width: 1024,
            height: 768,
            guidance_scale: 7.5
        }, {
            timeout: 30000
        });
        
        if (!response.data?.image) {
            throw new Error('Invalid response format');
        }
        
        return response.data.image.startsWith('data:image') 
            ? response.data.image
            : `data:image/png;base64,${response.data.image}`;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Failed to generate background');
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

export const removeProductBackground = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file); // Change 'image' to 'file' to match backend expectation

        const response = await api.post('/image-editor/remove-background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (!response.data || !response.data.image) {
            throw new Error('Invalid response format');
        }
        
        // Clean up the base64 string
        let imageData = response.data.image;
        if (!imageData.startsWith('data:image')) {
            imageData = `data:image/png;base64,${imageData}`;
        }
        
        return imageData;
    } catch (error) {
        console.error('Error removing background:', error);
        if (error.response?.status === 422) {
            throw new Error('Invalid image format or file too large. Please try another image.');
        }
        throw new Error('Failed to remove background: ' + error.message);
    }
};