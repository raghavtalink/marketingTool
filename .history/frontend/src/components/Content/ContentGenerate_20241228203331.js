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

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
        }
    };

    useEffect(() => {
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
        return content.split('\n\n').map(section => section.trim()).filter(Boolean);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setResponse(null);
        setIsLoading(true);
        
        try {
            const data = await generateContent(form.product_id, form.prompt_type, form.sentiment);
            setResponse(formatContent(data.content));
        } catch (err) {
            console.error('Generation error:', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to generate content');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content-generate-container">
            <h2>Generate AI Content</h2>
            {error && <p className="error">{error}</p>}
            
            <form onSubmit={handleGenerate} className="generate-form">
                <div className="form-group">
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
                </div>

                <div className="form-group">
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
                </div>

                {form.prompt_type === 'full_listing' && (
                    <div className="form-group">
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
                    </div>
                )}

                <button type="submit" className="generate-button" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
            </form>

            {isLoading && (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Generating content...</p>
                </div>
            )}

            {response && (
                <div className="response-container">
                    <h3>Generated Content:</h3>
                    <div className="content-sections">
                        {response.map((section, index) => (
                            <div key={index} className="content-section">
                                {section.includes(':') ? (
                                    <>
                                        <h4>{section.split(':')[0]}</h4>
                                        <p>{section.split(':').slice(1).join(':').trim()}</p>
                                    </>
                                ) : (
                                    <p>{section}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentGenerate;