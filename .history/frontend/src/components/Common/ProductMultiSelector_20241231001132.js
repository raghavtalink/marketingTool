import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import './CommonComponents.css';

const ProductMultiSelector = ({ selectedProducts, onChange, minSelection = 2 }) => {
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
      <label htmlFor="products-multi-select">
        Select Products (minimum {minSelection})
      </label>
      <select
        id="products-multi-select"
        multiple
        value={selectedProducts}
        onChange={(e) => {
          const selected = Array.from(
            e.target.selectedOptions,
            option => option.value
          );
          onChange(selected);
        }}
        className="selector-input multi"
      >
        {products.map(product => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </select>
      {error && <div className="selector-error">{error}</div>}
      <small className="selector-help">
        Hold Ctrl/Cmd to select multiple products
      </small>
    </div>
  );
};

export default ProductMultiSelector;