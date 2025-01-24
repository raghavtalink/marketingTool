// src/components/Content/ContentGenerate.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { generateContent } from '../../services/content';
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
        
        // Split content into sections based on known headers
        const sections = [];
        let currentSection = { title: '', content: [] };
        
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return;

            // Check if line is a header
            if (line.includes(':')) {
                const [title, ...rest] = line.split(':');
                // If it's a main section header
                if (title.toUpperCase() === title || 
                    ['Product Description', 'Key Highlights', 'How to Use', 'Product Details', 
                     'Competitor Analysis', 'SEO Optimization', 'Call-to-Action'].includes(title.trim())) {
                    if (currentSection.title) {
                        sections.push({ ...currentSection });
                    }
                    currentSection = {
                        title: title.trim(),
                        content: rest.length ? [rest.join(':').trim()] : []
                    };
                } else {
                    // It's a sub-point
                    currentSection.content.push(line);
                }
            } else {
                currentSection.content.push(line);
            }
        });
        
        // Add the last section
        if (currentSection.title) {
            sections.push(currentSection);
        }

        return sections;
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setResponse(null);
        setIsLoading(true);
        
        try {
            const data = await generateContent(form.product_id, form.prompt_type, form.sentiment);
            // Only use formatContent for full_listing type
            if (form.prompt_type === 'full_listing') {
                setResponse(formatContent(data.content));
            } else {
                // For other types, set the response directly
                setResponse(data.content);
            }
        } catch (err) {
            console.error('Generation error:', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to generate content');
        } finally {
            setIsLoading(false);
        }
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
            case 'seo_keywords':
                return (
                    <div className="generated-content">
                        <div className="content-section">
                            <h3>SEO Keywords</h3>
                            <ul className="keyword-list">
                                {response.split(',').map((keyword, index) => (
                                    <li key={index}>{keyword.trim()}</li>
                                ))}
                            </ul>
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
            {error && <p className="error">{error}</p>}
            
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
                    <option value="seo_keywords">SEO Keywords</option>
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