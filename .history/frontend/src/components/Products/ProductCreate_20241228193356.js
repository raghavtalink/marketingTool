// src/components/Products/ProductCreate.js
import React, { useState } from 'react';
import { createProduct } from '../../services/products';
import { useNavigate } from 'react-router-dom';

const ProductCreate = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    inventory_count: '',
    competitor_urls: [''],
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'competitor_urls') {
      const competitor_urls = [...form.competitor_urls];
      competitor_urls[index] = value;
      setForm({
        ...form,
        competitor_urls,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const addCompetitorField = () => {
    setForm({
      ...form,
      competitor_urls: [...form.competitor_urls, ''],
    });
  };

  const removeCompetitorField = (index) => {
    const competitor_urls = [...form.competitor_urls];
    competitor_urls.splice(index, 1);
    setForm({
      ...form,
      competitor_urls,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const productData = {
      ...form,
      price: parseFloat(form.price) || 0,
      inventory_count: parseInt(form.inventory_count) || 0,
    };
    try {
      await createProduct(productData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create product');
    }
  };

  return (
    <div className="product-create-container">
      <h2>Create New Product</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
        />

        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          name="price"
          value={form.price}
          onChange={handleChange}
        />

        <label>Inventory Count:</label>
        <input
          type="number"
          name="inventory_count"
          value={form.inventory_count}
          onChange={handleChange}
        />

        <label>Currency:</label>
        <select
          name="currency"
          value={form.currency}
          onChange={handleChange}
          required
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="INR">INR</option>
          <option value="JPY">JPY</option>
          {/* Add more currencies as needed */}
        </select>

        <label>Competitor URLs:</label>
        {form.competitor_urls.map((url, index) => (
          <div key={index} className="competitor-url-field">
            <input
              type="url"
              name="competitor_urls"
              value={url}
              onChange={(e) => handleChange(e, index)}
              placeholder="https://www.amazon.com/..."
              required
            />
            {form.competitor_urls.length > 1 && (
              <button type="button" onClick={() => removeCompetitorField(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCompetitorField}>
          Add Another Competitor URL
        </button>

        <button type="submit" className="btn">
          Create Product
        </button>
      </form>
    </div>
  );
};

export default ProductCreate;