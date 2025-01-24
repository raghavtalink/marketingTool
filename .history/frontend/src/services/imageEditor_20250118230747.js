import api from './api';

export const generateBackground = async (prompt) => {
    const response = await api.post('/image-editor/generate', { 
        prompt: prompt,
        steps: 4  // optional
    });
    return response.data;
};

export const removeBackground = async (formData) => {
    const response = await api.post('/image-editor/remove-background', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const harmonizeImages = async (imageData) => {
    const response = await api.post('/image-editor/harmonize', imageData);
    return response.data;
};