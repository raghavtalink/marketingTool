import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { createCampaign, getCampaigns } from '../../services/social-media';
import './SocialMediaCampaigns.css';

const SocialMediaCampaigns = () => {
    const [products, setProducts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        product_id: '',
        campaign_name: '',
        platforms: [],
        objectives: [],
        target_audience: '',
        duration: 30
    });

    useEffect(() => {
        fetchProducts();
        fetchCampaigns();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products');
        }
    };

    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (err) {
            setError('Failed to fetch campaigns');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await createCampaign(form);
            await fetchCampaigns();
            setForm({
                product_id: '',
                platforms: [],
                objectives: [],
                target_audience: '',
                duration: 30
            });
        } catch (err) {
            setError('Failed to create campaign');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="campaigns-container">
            <h2>Social Media Campaigns</h2>
            
            <div className="campaigns-grid">
                <div className="create-campaign">
                    <h3>Create New Campaign</h3>
                    <form onSubmit={handleSubmit}>
                        <select
                            value={form.product_id}
                            onChange={(e) => setForm({...form, product_id: e.target.value})}
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>

                        <div className="checkbox-group">
                            <label>Platforms:</label>
                            {['Instagram', 'Facebook', 'Twitter', 'LinkedIn'].map(platform => (
                                <label key={platform}>
                                    <input
                                        type="checkbox"
                                        checked={form.platforms.includes(platform)}
                                        onChange={(e) => {
                                            const platforms = e.target.checked
                                                ? [...form.platforms, platform]
                                                : form.platforms.filter(p => p !== platform);
                                            setForm({...form, platforms});
                                        }}
                                    />
                                    {platform}
                                </label>
                            ))}
                        </div>

                        <div className="checkbox-group">
                            <label>Objectives:</label>
                            {['Brand Awareness', 'Sales', 'Engagement', 'Lead Generation'].map(objective => (
                                <label key={objective}>
                                    <input
                                        type="checkbox"
                                        checked={form.objectives.includes(objective)}
                                        onChange={(e) => {
                                            const objectives = e.target.checked
                                                ? [...form.objectives, objective]
                                                : form.objectives.filter(o => o !== objective);
                                            setForm({...form, objectives});
                                        }}
                                    />
                                    {objective}
                                </label>
                            ))}
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </form>
                </div>

                <div className="campaigns-list">
                    <h3>Your Campaigns</h3>
                    {campaigns.map(campaign => (
                        <div key={campaign._id} className="campaign-card">
                            <h4>{products.find(p => p._id === campaign.product_id)?.name}</h4>
                            <p><strong>Platforms:</strong> {campaign.platforms.join(', ')}</p>
                            <p><strong>Objectives:</strong> {campaign.objectives.join(', ')}</p>
                            <div className="campaign-content">
                                <pre>{campaign.content_plan}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialMediaCampaigns;