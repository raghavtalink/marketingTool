import React from 'react';

const CampaignDisplay = ({ campaign, product }) => {
    const formatContent = (content) => {
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