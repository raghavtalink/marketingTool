// frontend/src/services/socialMedia.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://103.40.61.70:30081';

export const getCampaigns = async () => {
    try {
        const response = await axios.get(`${API_URL}/social-media/list`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCampaign = async (campaignData) => {
    try {
        const response = await axios.post(`${API_URL}/social-media/create`, campaignData);
        return response.data;
    } catch (error) {
        throw error;
    }
};