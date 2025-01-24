import React from 'react';
import DOMPurify from 'dompurify';

const BotResponse = ({ htmlContent, isSEO }) => {
    // Handle null, undefined, or non-string content
    if (!htmlContent) return null;

    // Convert to string if it's an object
    const contentString = typeof htmlContent === 'object' 
        ? JSON.stringify(htmlContent) 
        : String(htmlContent);

    // Clean content based on type
    const cleanContent = isSEO 
        ? contentString
            .replace(/,(\s*,)*/g, '') // Remove multiple commas and commas with whitespace
            .replace(/\n\s*\n/g, '\n') // Normalize multiple line breaks
            .replace(/^\s*,\s*|\s*,\s*$/g, '') // Remove leading/trailing commas
            .trim()
        : contentString
            .replace(/\n\s*\n/g, '\n') // Only normalize line breaks for chatbot
            .trim();

    const sanitizedHtml = DOMPurify.sanitize(cleanContent, {
        ALLOWED_TAGS: ['h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'br', 'div', 'table', 'tr', 'td', 'th'],
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