import React, { useEffect, useState } from 'react';
import { getCampaigns } from '../../services/socialMedia';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    setError('');
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError('Failed to fetch campaigns');
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="campaigns-container">
      <h2>Your Social Media Campaigns</h2>
      {error && <p className="error">{error}</p>}
      {campaigns.length === 0 ? (
        <p>No campaigns found. <a href="/social-media/create">Create a campaign</a>.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Product</th>
              <th>Platforms</th>
              <th>Objectives</th>
              <th>Content Plan</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.campaign_name}</td>
                <td>{campaign.product_id}</td>
                <td>{campaign.platforms.join(', ')}</td>
                <td>{campaign.objectives.join(', ')}</td>
                <td>{campaign.content_plan ? <button>View Plan</button> : 'Generating...'}</td>
                <td>{new Date(campaign.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CampaignList;