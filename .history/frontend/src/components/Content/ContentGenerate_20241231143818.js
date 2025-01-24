// src/components/Content/ContentGenerate.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { generateContent } from '../../services/content';
import BotResponse from '../Chatbot/BotResponse';
import './ContentGenerate.css';

const ContentGenerate = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        product_id: '',
        prompt_type: 'title',
        sentiment: 'neutral',
    });
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to fetch products');
            }
        };
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const formatContent = (content) => {
        if (!content) return [];
        
        // Split content into sections
        const sections = content.split('\n').filter(line => line.trim());
        const formattedSections = [];
        let currentSection = { title: '', content: [] };
        
        sections.forEach(line => {
            // Check if line is a header (all caps or known section titles)
            if (line.toUpperCase() === line || 
                ['PRODUCT TITLE', 'DESCRIPTION', 'KEY FEATURES', 'SPECIFICATIONS', 
                 'BENEFITS', 'COMPETITION ANALYSIS', 'TARGET AUDIENCE'].some(header => 
                    line.toUpperCase().includes(header))) {
                if (currentSection.title) {
                    formattedSections.push({...currentSection});
                }
                currentSection = { title: line.trim(), content: [] };
            } else {
                currentSection.content.push(line.trim());
            }
        });
        
        // Add the last section
        if (currentSection.title) {
            formattedSections.push(currentSection);
        }
        
        return formattedSections;
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setResponse(null);
        setIsLoading(true);
        
        try {
            const data = await generateContent(form.product_id, form.prompt_type, form.sentiment);
            if (form.prompt_type === 'full_listing') {
                const formattedContent = formatContent(data.content || '');
                if (!Array.isArray(formattedContent)) {
                    throw new Error('Failed to format content properly');
                }
                setResponse(formattedContent);
            } else if (form.prompt_type === 'seo') {
                const keywords = data.content
                    .split('\n')
                    .filter(line => line.trim() && 
                           !line.startsWith('Note:') && 
                           !line.startsWith('Keyword Clusters') &&
                           !line.startsWith('Additional'));
                setResponse(keywords.join(','));
            } else {
                setResponse(data.content);
            }
        } catch (err) {
            console.error('Generation error:', err);
            const errorMessage = err.response?.data?.detail || 
                               err.response?.data?.message || 
                               err.message || 
                               'Failed to generate content';
            setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const formatSEOContent = (content) => {
        if (!content || typeof content !== 'string') return null;
        
        // Remove extra commas and clean up newlines
        const cleanContent = content.replace(/,+/g, ',').replace(/\n+/g, '\n').trim();
        
        // Split into sections
        const sections = cleanContent.split(/(?=\n[A-Z][^:]+:)/).filter(Boolean);
        
        return sections.map((section, index) => {
            const [title, ...contentLines] = section.split('\n');
            const content = contentLines.join('\n').trim();
            
            return (
                <div key={index} className="seo-section">
                    {index === 0 ? <h3>{title}</h3> : <h4>{title}</h4>}
                    <div className="section-content">
                        {content.split('\n').map((line, i) => {
                            // Handle bullet points
                            if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                                return <li key={i} className="bullet-point">{line.replace(/^[-•]/, '').trim()}</li>;
                            }
                            // Handle keywords with search volume
                            if (line.includes('searches/month')) {
                                const [keyword, ...description] = line.split('-').map(s => s.trim());
                                return (
                                    <div key={i} className="keyword-item">
                                        <strong>{keyword}</strong>
                                        {description.length > 0 && <span> - {description.join('-')}</span>}
                                    </div>
                                );
                            }
                            // Handle highlight sections
                            if (line.includes('meta tags') || line.includes('Remember to conduct')) {
                                return <div key={i} className="highlight">{line}</div>;
                            }
                            // Regular paragraph
                            if (line.trim()) {
                                return <p key={i}>{line}</p>;
                            }
                            return null;
                        })}
                    </div>
                </div>
            );
        });
    };

    const renderResponse = () => {
        if (!response) return null;

        switch (form.prompt_type) {
            case 'title':
                return (
                    <div className="generated-content">
                        <div className="content-section">
                            <h3>Generated Title</h3>
                            <p>{response}</p>
                        </div>
                    </div>
                );
            case 'seo':
                return (
                    <div className="generated-content">
                        <div className="content-section">
                            <h3>SEO Keywords</h3>
                            <BotResponse htmlContent={response} isSEO={true} />
                        </div>
                    </div>
                );
            case 'description':
                return (
                    <div className="generated-content">
                        <div className="content-section">
                            <h3>Product Description</h3>
                            <p>{response}</p>
                        </div>
                    </div>
                );
            case 'full_listing':
                if (!Array.isArray(response)) {
                    console.error('Expected array for full_listing response, got:', response);
                    return <p>Error: Invalid response format</p>;
                }
                return (
                    <div className="generated-content">
                        {response.map((section, index) => (
                            <div key={index} className="content-section">
                                <h3>{section.title}</h3>
                                <div className="section-content">
                                    {section.content.map((item, i) => (
                                        <p key={i}>{item}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return <p>Unsupported content type</p>;
        }
    };

    return (
        <div className="content-generate-container">
            <h2>Generate AI Content</h2>
            {error && <div className="error">{typeof error === 'string' ? error : 'An error occurred'}</div>}
            
            <form onSubmit={handleGenerate}>
                <label>Product:</label>
                <select
                    name="product_id"
                    value={form.product_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                        <option key={product._id} value={product._id}>
                            {product.name}
                        </option>
                    ))}
                </select>

                <label>Content Type:</label>
                <select
                    name="prompt_type"
                    value={form.prompt_type}
                    onChange={handleChange}
                    required
                >
                    <option value="title">Title</option>
                    <option value="description">Description</option>
                    <option value="seo">SEO Keywords</option>
                    <option value="full_listing">Full Listing</option>
                </select>

                {form.prompt_type === 'full_listing' && (
                    <>
                        <label>Sentiment:</label>
                        <select
                            name="sentiment"
                            value={form.sentiment}
                            onChange={handleChange}
                            required
                        >
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
            </form>

            {isLoading && (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Generating content...</p>
                </div>
            )}

            {renderResponse()}
        </div>
    );
};

export default ContentGenerate;