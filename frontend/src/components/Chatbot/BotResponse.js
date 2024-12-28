import React from 'react';
import DOMPurify from 'dompurify';

const BotResponse = ({ htmlContent }) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['h3', 'ul', 'ol', 'li', 'p', 'strong', 'br', 'div'],
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