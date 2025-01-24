import api from './api';

export const createSocialMediaCampaign = async (campaign) => {
  const response = await api.post('/social-media/create', campaign);
  return response.data;
};

export const getCampaigns = async () => {
  const response = await api.get('/social-media/campaigns');
  return response.data;
};