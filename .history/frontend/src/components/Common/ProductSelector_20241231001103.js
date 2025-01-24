import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import './CommonComponents.css';

const ProductSelector = ({ selectedProduct, onSelect }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="selector-group">
      <label htmlFor="product-select">Select Product</label>
      <select
        id="product-select"
        value={selectedProduct}
        onChange={(e) => onSelect(e.target.value)}
        className="selector-input"
      >
        <option value="">Choose a product...</option>
        {products.map(product => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </select>
      {error && <div className="selector-error">{error}</div>}
    </div>
  );
};

export default ProductSelector;