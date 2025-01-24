// frontend/src/components/SocialMedia/CampaignDisplay.js
import React from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaHashtag } from 'react-icons/fa';
import { BsMegaphone, BsCashCoin, BsGraphUp, BsBarChart, BsPeople, BsCalendarCheck, BsBullseye } from 'react-icons/bs';
import './CampaignDisplay.css';

const CampaignDisplay = ({ campaign, product }) => {
    if (!campaign) {
        return (
            <div className="no-campaign-message">
                <p>Select a campaign to view details or create a new one.</p>
            </div>
        );
    }

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
            
            const getIconForSection = (title) => {
                const t = title.toLowerCase();
                if (t.includes('target audience')) return <BsPeople className="section-icon" />;
                if (t.includes('hashtags')) return <FaHashtag className="section-icon" />;
                if (t.includes('scheduling')) return <BsCalendarCheck className="section-icon" />;
                if (t.includes('objectives')) return <BsBullseye className="section-icon" />;
                return null;
            };
            
            return (
                <div key={index} className="campaign-detail-section">
                    <div className="section-header">
                        {getIconForSection(title)}
                        <h4>{title.trim()}</h4>
                    </div>
                    <div className="section-content">
                        {content.split('\n').map((line, i) => {
                            if (line.trim().endsWith(':')) {
                                return <h5 key={i}>{line}</h5>;
                            }
                            if (line.includes('#')) {
                                return (
                                    <span key={i} className="hashtag">
                                        {line.trim()}
                                    </span>
                                );
                            }
                            if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                                return <li key={i} className="bullet-point">{line.replace(/^[-•]/, '').trim()}</li>;
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
                    <p className="product-name">{product?.name || 'No product selected'}</p>
                </div>
                
                <div className="campaign-meta-grid">
                    <div className="meta-card platforms">
                        <h3>Platforms</h3>
                        <div className="platform-icons">
                            {campaign.platforms?.map(platform => (
                                <span key={platform} className="platform-badge">
                                    {getPlatformIcon(platform)}
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="meta-card objectives">
                        <h3>Objectives</h3>
                        <div className="objective-icons">
                            {campaign.objectives?.map(objective => (
                                <span key={objective} className="objective-badge">
                                    {getObjectiveIcon(objective)}
                                    {objective}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="campaign-content">
                {formatContent(campaign.content_plan)}
            </div>
        </div>
    );
};

export default CampaignDisplay;