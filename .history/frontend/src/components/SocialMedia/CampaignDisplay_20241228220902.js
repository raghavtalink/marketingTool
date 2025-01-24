import React from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { BsBarChart, BsGraphUp, BsMegaphone, BsCashCoin } from 'react-icons/bs';

const CampaignDisplay = ({ campaign, product }) => {
    const getPlatformIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return <FaInstagram />;
            case 'facebook': return <FaFacebook />;
            case 'twitter': return <FaTwitter />;
            case 'linkedin': return <FaLinkedin />;
            default: return null;
        }
    };

    const getObjectiveIcon = (objective) => {
        switch (objective.toLowerCase()) {
            case 'brand awareness': return <BsMegaphone />;
            case 'sales': return <BsCashCoin />;
            case 'engagement': return <BsGraphUp />;
            case 'lead generation': return <BsBarChart />;
            default: return null;
        }
    };

    const formatContent = (content) => {
        if (!content || typeof content !== 'string') return null;
        
        const sections = content.split(/(?=\n[A-Z][^:]+:)/).filter(Boolean);
        
        return sections.map((section, index) => {
            const [title, ...contentLines] = section.split('\n');
            const content = contentLines.join('\n').trim();
            
            return (
                <div key={index} className="campaign-detail-section">
                    <h4>{title.trim()}</h4>
                    <div className="section-content">
                        {content.split('\n').map((line, i) => {
                            if (line.trim().endsWith(':')) {
                                return <h5 key={i}>{line}</h5>;
                            }
                            return <p key={i}>{line}</p>;
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="campaign-details-wrapper">
            <div className="campaign-details-header">
                <div className="campaign-title">
                    <h2>{campaign.campaign_name}</h2>
                    <p className="product-name">{product?.name}</p>
                </div>
                
                <div className="campaign-meta-grid">
                    <div className="meta-card platforms">
                        <h3>Platforms</h3>
                        <div className="platform-icons">
                            {campaign.platforms.map(platform => (
                                <span key={platform} className="platform-badge">
                                    {getPlatformIcon(platform)}
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="meta-card objectives">
        if (!content || typeof content !== 'string') {
            console.log('Content received:', content); // Debug log
            return null;
        }
        
        try {
            // Split content into sections based on headings
            const sections = content.split(/(?=Here's a comprehensive|Campaign Name:|Content Strategy:|Post Ideas:|Captions and Hashtags:|Scheduling Suggestions:)/).filter(Boolean);
            
            return sections.map((section, index) => {
                const lines = section.trim().split('\n');
                const title = lines[0].replace(':', '');
                const content = lines.slice(1).join('\n');
                
                return (
                    <div key={index} className="campaign-section">
                        <h3>{title.trim()}</h3>
                        <div className="content-plan">
                            {content.trim().split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                );
            });
        } catch (error) {
            console.error('Error formatting content:', error);
            // Fallback to display raw content
            return (
                <div className="campaign-section">
                    <div className="content-plan">
                        {content}
                    </div>
                </div>
            );
        }
    };

    if (!campaign) return null;

    return (
        <div className="campaign-content-wrapper">
            <div className="campaign-meta">
                <div className="meta-item">
                    <strong>Campaign Name</strong>
                    {campaign.campaign_name}
                </div>
                <div className="meta-item">
                    <strong>Product</strong>
                    {product?.name || 'N/A'}
                </div>
                <div className="meta-item">
                    <strong>Platforms</strong>
                    <div className="tag-list">
                        {campaign.platforms.map(platform => (
                            <span key={platform} className="tag">{platform}</span>
                        ))}
                    </div>
                </div>
                <div className="meta-item">
                    <strong>Objectives</strong>
                    <div className="tag-list">
                        {campaign.objectives.map(objective => (
                            <span key={objective} className="tag">{objective}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="campaign-content">
                <h3>Campaign Content</h3>
                {formatContent(campaign.content_plan)}
            </div>
        </div>
    );
};

export default CampaignDisplay;