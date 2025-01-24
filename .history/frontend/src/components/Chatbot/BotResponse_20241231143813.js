import React from 'react';
import DOMPurify from 'dompurify';

const BotResponse = ({ htmlContent, isSEO }) => {
    // Clean content based on type
    const cleanContent = isSEO 
        ? htmlContent
            .replace(/,(\s*,)*/g, '') // Remove multiple commas and commas with whitespace
            .replace(/\n\s*\n/g, '\n') // Normalize multiple line breaks
            .replace(/^\s*,\s*|\s*,\s*$/g, '') // Remove leading/trailing commas
            .trim()
        : htmlContent
            .replace(/\n\s*\n/g, '\n') // Only normalize line breaks for chatbot
            .trim();

    const sanitizedHtml = DOMPurify.sanitize(cleanContent, {
        ALLOWED_TAGS: ['h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'br', 'div'],
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