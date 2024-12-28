import React, { useState, useEffect } from "react";
import { getProducts } from "../../services/products";
import { createCampaign, getCampaigns } from "../../services/social-media";
import "./SocialMediaCampaigns.css";
import CampaignDisplay from "./CampaignDisplay";

const SocialMediaCampaigns = () => {
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    campaign_name: "",
    platforms: [],
    objectives: [],
    target_audience: "",
    duration: 30,
  });
  const [selectedCampaign, setSelectedCampaign] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCampaigns();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError("Failed to fetch campaigns");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await createCampaign(form);
      await fetchCampaigns();
      setForm({
        product_id: "",
        campaign_name: "",
        platforms: [],
        objectives: [],
        target_audience: "",
        duration: 30,
      });
    } catch (err) {
      setError("Failed to create campaign");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="campaigns-container">
      <div className="campaigns-header">
        <h2>Social Media Campaigns</h2>
        <div className="campaign-selector">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">Select a campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.campaign_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCampaign ? (
        <CampaignDisplay
          campaign={campaigns.find((c) => c._id === selectedCampaign)}
          product={products.find(
            (p) =>
              p._id ===
              campaigns.find((c) => c._id === selectedCampaign)?.product_id
          )}
        />
      ) : (
        <div className="create-campaign-form">
          <h3>Create New Campaign</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Campaign Name</label>
              <input
                type="text"
                value={form.campaign_name}
                onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                required
                placeholder="Enter a memorable name for your campaign"
              />
            </div>

            <div className="form-group">
              <label>Select Product</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
              >
                <option value="">Choose a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Platforms</label>
              <div className="checkbox-group">
                {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((platform) => (
                  <label key={platform} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(platform)}
                      onChange={(e) => {
                        const platforms = e.target.checked
                          ? [...form.platforms, platform]
                          : form.platforms.filter((p) => p !== platform);
                        setForm({ ...form, platforms });
                      }}
                    />
                    {platform}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Campaign Objectives</label>
              <div className="checkbox-group">
                {["Brand Awareness", "Sales", "Engagement", "Lead Generation"].map(
                  (objective) => (
                    <label key={objective} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.objectives.includes(objective)}
                        onChange={(e) => {
                          const objectives = e.target.checked
                            ? [...form.objectives, objective]
                            : form.objectives.filter((o) => o !== objective);
                          setForm({ ...form, objectives });
                        }}
                      />
                      {objective}
                    </label>
                  )
                )}
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SocialMediaCampaigns;
