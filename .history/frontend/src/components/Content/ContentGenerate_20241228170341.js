// src/components/Content/ContentGenerate.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { generateContent } from '../../services/content';

const ContentGenerate = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
      product_id: '',
      prompt_type: 'title',
    });
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
  
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        console.log('Fetched products:', data); // Debug log
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err); // Debug log
        setError('Failed to fetch products');
      }
    };
  
    useEffect(() => {
      fetchProducts();
    }, []);
  
    const handleChange = (e) => {
      const newValue = e.target.value;
      console.log(`Changing ${e.target.name} to:`, newValue); // Debug log
      setForm({
        ...form,
        [e.target.name]: newValue,
      });
    };
  
    const handleGenerate = async (e) => {
      e.preventDefault();
      console.log('Form state before submission:', form); // Debug log
      setError('');
      setResponse(null);
      try {
        const data = await generateContent(form.product_id, form.prompt_type);
        setResponse(data.message);
      } catch (err) {
        console.error('Generation error:', err.response?.data); // Debug log
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
              console.log('Product in map:', product); // Debug log
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
          </select>
  
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