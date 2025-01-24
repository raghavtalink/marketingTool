// src/components/Content/ContentGenerate.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { generateContent } from '../../services/content';

const ContentGenerate = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
      product_id: '',
      prompt_type: 'title',
      sentiment: 'neutral',
    });
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
  
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        console.log('Raw product data:', data);
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
      const newValue = e.target.value;
      console.log(`Changing ${e.target.name} to:`, newValue);
      setForm({
        ...form,
        [e.target.name]: newValue,
      });
    };
  
    const handleGenerate = async (e) => {
      e.preventDefault();
      console.log('Form state before submission:', form);
      setError('');
      setResponse(null);
      try {
        const data = await generateContent(form.product_id, form.prompt_type, form.sentiment);
        console.log('API Response:', data);
        setResponse(data.content);
      } catch (err) {
        console.error('Generation error:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to generate content');
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
            {products.map((product) => {
              console.log('Product in map:', product);
              return (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              );
            })}
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
  
          <button type="submit" className="btn">
            Generate
          </button>
        </form>
  
        {response && (
          <div className="response-container">
            <h3>Generated Content:</h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    );
  };
  

export default ContentGenerate;