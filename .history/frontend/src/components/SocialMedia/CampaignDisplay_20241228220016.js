import React from 'react';

const CampaignDisplay = ({ campaign, product }) => {
    const formatContent = (content) => {
        if (!content) return null;
        
        // Split content into sections based on headings
        const sections = content.split(/(?=\n[A-Z][^:]+:)/);
        
        return sections.map((section, index) => {
            const [title, ...content] = section.split('\n');
            return (
                <div key={index} className="campaign-section">
                    <h3>{title.trim()}</h3>
                    <div className="content-plan">
                        {content.join('\n').trim()}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="campaign-content-wrapper">
            <div className="campaign-meta">
                <div className="meta-item">
                    <strong>Campaign Name</strong>
                    {campaign.campaign_name}
                </div>
                <div className="meta-item">
                    <strong>Product</strong>
                    {product?.name}
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
            {formatContent(campaign.content_plan)}
        </div>
    );
};

export default CampaignDisplay;