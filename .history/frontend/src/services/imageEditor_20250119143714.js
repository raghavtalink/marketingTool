import api from './api';

export const generateBackground = async (prompt) => {
    try {
        const response = await fetch('http://localhost:8000//image-editor/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Make sure the response contains the image data
        if (!data.image_url) {
            throw new Error('No image URL in response');
        }

        return data.image_url;
    } catch (error) {
        console.error('Error in generateBackground:', error);
        throw new Error('Failed to generate background: ' + error.message);
    }
};

export const removeBackground = async (imageUrl) => {
    try {
        const response = await fetch('http://localhost:8000/api/remove-background', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_url: imageUrl })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.image_url;
    } catch (error) {
        console.error('Error in removeBackground:', error);
        throw new Error('Failed to remove background: ' + error.message);
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

export const handleImageError = (error) => {
    console.error('Image processing error:', error);
    // You can add custom error handling here
    return {
        error: true,
        message: error.message || 'An error occurred while processing the image'
    };
};