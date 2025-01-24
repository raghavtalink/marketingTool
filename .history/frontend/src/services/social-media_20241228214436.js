import api from './api';

export const createCampaign = async (campaignData) => {
    const response = await api.post('/social-media/create', campaignData);
    return response.data;
};

export const getCampaigns = async () => {
    const response = await api.get('/social-media/list');
    return response.data;
};