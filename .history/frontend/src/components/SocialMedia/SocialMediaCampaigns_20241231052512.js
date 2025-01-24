// frontend/src/components/SocialMedia/SocialMediaCampaigns.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { getCampaigns, createCampaign } from '../../services/socialMedia';
import CampaignDisplay from './CampaignDisplay';
import './SocialMediaCampaigns.css';

const SocialMediaCampaigns = () => {
    const [products, setProducts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [form, setForm] = useState({
        product_id: '',
        campaign_name: '',
        platforms: [],
        objectives: [],
        target_audience: '',
        duration: 30,
    });

    const platformOptions = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];
    const objectiveOptions = ['Brand Awareness', 'Sales', 'Engagement', 'Lead Generation'];

    useEffect(() => {
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

        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const newCampaign = await createCampaign(form);
            setCampaigns([...campaigns, newCampaign]);
            setForm({
                product_id: '',
                campaign_name: '',
                platforms: [],
                objectives: [],
                target_audience: '',
                duration: 30,
            });
        } catch (err) {
            setError('Failed to create campaign. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (e, field) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            [field]: e.target.checked
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

            {error && <div className="error-message">{error}</div>}

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
                            <label>Duration (days)</label>
                            <input
                                type="number"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                                min="1"
                                max="365"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Campaign'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SocialMediaCampaigns;