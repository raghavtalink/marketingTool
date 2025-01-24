import React, { useState } from 'react';
import { createSocialMediaCampaign } from '../../services/socialMedia';
import { useNavigate } from 'react-router-dom';

const CampaignCreate = () => {
  const [form, setForm] = useState({
    product_id: '',
    campaign_name: '',
    platforms: [],
    objectives: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const platformsOptions = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Pinterest'];
  const objectivesOptions = ['Brand Awareness', 'Engagement', 'Lead Generation', 'Sales'];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      const updatedList = form[name];
      if (checked) {
        updatedList.push(value);
      } else {
        const index = updatedList.indexOf(value);
        if (index > -1) {
          updatedList.splice(index, 1);
        }
      }
      setForm({
        ...form,
        [name]: updatedList,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createSocialMediaCampaign(form);
      navigate('/social-media/campaigns');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create campaign');
    }
  };

  return (
    <div className="campaign-create-container">
      <h2>Create Social Media Campaign</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Product:</label>
        <select
          name="product_id"
          value={form.product_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a product</option>
          {/* Populate with products from your state or fetch here */}
        </select>

        <label>Campaign Name:</label>
        <input
          type="text"
          name="campaign_name"
          value={form.campaign_name}
          onChange={handleChange}
          required
        />

        <label>Platforms:</label>
        <div className="checkbox-group">
          {platformsOptions.map((platform) => (
            <label key={platform}>
              <input
                type="checkbox"
                name="platforms"
                value={platform}
                checked={form.platforms.includes(platform)}
                onChange={handleChange}
              />
              {platform}
            </label>
          ))}
        </div>

        <label>Objectives:</label>
        <div className="checkbox-group">
          {objectivesOptions.map((objective) => (
            <label key={objective}>
              <input
                type="checkbox"
                name="objectives"
                value={objective}
                checked={form.objectives.includes(objective)}
                onChange={handleChange}
              />
              {objective}
            </label>
          ))}
        </div>

        <button type="submit" className="btn">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default CampaignCreate;