// src/components/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/products';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="products-container">
      <h2>Your Products</h2>
      {error && <p className="error">{error}</p>}
      {products.length === 0 ? (
        <p>No products found. <a href="/products/create">Add a product</a>.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Competitors</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.description || 'N/A'}</td>
                <td>{product.category || 'N/A'}</td>
                <td>${product.price || '0.00'}</td>
                <td>{product.inventory_count || '0'}</td>
                <td>
                  {product.competitor_urls && product.competitor_urls.length > 0 ? (
                    <ul>
                      {product.competitor_urls.map((url, idx) => (
                        <li key={idx}><a href={url} target="_blank" rel="noopener noreferrer">Competitor {idx + 1}</a></li>
                <td>{new Date(product.created_at).toLocaleString()}</td>
                <td>{new Date(product.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;