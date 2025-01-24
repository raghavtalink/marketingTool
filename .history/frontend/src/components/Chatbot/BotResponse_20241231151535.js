import React from 'react';
import DOMPurify from 'dompurify';

const BotResponse = ({ htmlContent, isSEO }) => {
    // Handle null, undefined, or non-string content
    if (!htmlContent) return null;

    // Convert to string if it's an object
    const contentString = typeof htmlContent === 'object' 
        ? JSON.stringify(htmlContent) 
        : String(htmlContent);

    // For debugging
    console.log('Content received in BotResponse:', contentString);

    // Split content into sections and format
    const formatFullListing = (content) => {
        const sections = content.split('\n').filter(line => line.trim());
        return sections.map((line, index) => {
            if (line.includes(':')) {
                const [title, ...rest] = line.split(':');
                return `<div class="content-item">
                    <strong>${title.trim()}:</strong> ${rest.join(':').trim()}
                </div>`;
            }
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return `<li class="bullet-point">${line.replace(/^[•-]/, '').trim()}</li>`;
            }
            return `<p>${line}</p>`;
        }).join('');
    };

    // Clean and format content based on type
    let cleanContent;
    if (isSEO) {
        cleanContent = contentString
            .replace(/,(\s*,)*/g, '')
            .replace(/\n\s*\n/g, '\n')
            .replace(/^\s*,\s*|\s*,\s*$/g, '')
            .trim();
    } else {
        // For full listing and other content types
        cleanContent = formatFullListing(contentString);
    }

    const sanitizedHtml = DOMPurify.sanitize(cleanContent, {
        ALLOWED_TAGS: ['h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'br', 'div', 'span'],
        ALLOWED_ATTR: ['class']
    });

    return (
        <div 
            className="bot-response"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default BotResponse;