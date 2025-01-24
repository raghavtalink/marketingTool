// frontend/src/services/socialMedia.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8';

export const getCampaigns = async () => {
    try {
        const response = await axios.get(`${API_URL}/campaigns/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCampaign = async (campaignData) => {
    try {
        const response = await axios.post(`${API_URL}/campaigns/`, campaignData);
        return response.data;
    } catch (error) {
        throw error;
    }
};