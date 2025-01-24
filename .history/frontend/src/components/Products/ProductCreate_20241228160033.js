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
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
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

        <button type="submit" className="btn">
          Create Product
        </button>
      </form>
    </div>
  );
};

export default ProductCreate;