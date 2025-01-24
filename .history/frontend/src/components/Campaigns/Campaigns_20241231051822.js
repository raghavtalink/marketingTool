// frontend/src/components/Campaigns/Campaigns.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { createSocialMediaCampaign, getCampaigns } from '../../services/socialMedia';
import CampaignDisplay from '../SocialMedia/CampaignDisplay';
import './Campaigns.css';

const Campaigns = () => {
    const [products, setProducts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState({
        product_id: '',
        campaign_name: '',
        platforms: [],
        objectives: [],
        target_audience: '',
        duration: 30,
        content_plan: ''
    });

    const platformOptions = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];
    const objectiveOptions = ['Brand Awareness', 'Sales', 'Engagement', 'Lead Generation'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [productsData, campaignsData] = await Promise.all([
                getProducts(),
                getCampaigns()
            ]);
            setProducts(productsData);
            setCampaigns(campaignsData);
        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const newCampaign = await createCampaign(form);
            setCampaigns([...campaigns, newCampaign]);
            setShowCreateForm(false);
            setForm({
                product_id: '',
                campaign_name: '',
                platforms: [],
                objectives: [],
                target_audience: '',
                duration: 30,
                content_plan: ''
            });
        } catch (err) {
            setError('Failed to create campaign. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (e, field) => {
        const value = e.target.value;
        const isChecked = e.target.checked;
        setForm(prev => ({
            ...prev,
            [field]: isChecked 
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="campaigns-container">
            <div className="campaigns-header">
                <h2>Campaign Management</h2>
                <div className="header-actions">
                    {!showCreateForm && (
                        <button 
                            className="create-button"
                            onClick={() => setShowCreateForm(true)}
                        >
                            Create New Campaign
                        </button>
                    )}
                    {campaigns.length > 0 && !showCreateForm && (
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="campaign-selector"
                        >
                            <option value="">Select a campaign</option>
                            {campaigns.map((campaign) => (
                                <option key={campaign._id} value={campaign._id}>
                                    {campaign.campaign_name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showCreateForm ? (
                <div className="create-campaign-form">
                    <div className="form-header">
                        <h3>Create New Campaign</h3>
                        <button 
                            className="close-button"
                            onClick={() => setShowCreateForm(false)}
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Product</label>
                            <select
                                value={form.product_id}
                                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                required
                            >
                                <option value="">Select a product</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Campaign Name</label>
                            <input
                                type="text"
                                value={form.campaign_name}
                                onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                                required
                                placeholder="Enter campaign name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Platforms</label>
                            <div className="checkbox-group">
                                {platformOptions.map((platform) => (
                                    <label key={platform} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={platform}
                                            checked={form.platforms.includes(platform)}
                                            onChange={(e) => handleCheckboxChange(e, 'platforms')}
                                        />
                                        {platform}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Objectives</label>
                            <div className="checkbox-group">
                                {objectiveOptions.map((objective) => (
                                    <label key={objective} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={objective}
                                            checked={form.objectives.includes(objective)}
                                            onChange={(e) => handleCheckboxChange(e, 'objectives')}
                                        />
                                        {objective}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Target Audience</label>
                            <textarea
                                value={form.target_audience}
                                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                                placeholder="Describe your target audience"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Content Plan</label>
                            <textarea
                                value={form.content_plan}
                                onChange={(e) => setForm({ ...form, content_plan: e.target.value })}
                                placeholder="Outline your content plan"
                                required
                                rows={5}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Campaign'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowCreateForm(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : selectedCampaign ? (
                <CampaignDisplay
                    campaign={campaigns.find((c) => c._id === selectedCampaign)}
                    product={products.find(
                        (p) =>
                            p._id ===
                            campaigns.find((c) => c._id === selectedCampaign)?.product_id
                    )}
                />
            ) : (
                <div className="no-selection-message">
                    <p>Select a campaign to view details or create a new one using the button above.</p>
                </div>
            )}
        </div>
    );
};

export default Campaigns;