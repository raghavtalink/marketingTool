// src/components/Products/ProductList.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './ProductTable.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(price);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="products-wrapper">
      <div className="products-header">
        <h2>Your Products</h2>
        <Link to="/products/create" className="add-product-button">
          <FaPlus /> Add Product
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="products-table-container">
        {products.length === 0 ? (
          <p className="no-products">No products found. Add your first product to get started.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Competitors</th>
                <th>Currency</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="product-name">{product.name}</td>
                  <td className="product-description">{truncateText(product.description)}</td>
                  <td>{product.category || 'N/A'}</td>
                  <td className="product-price">{formatPrice(product.price, product.currency)}</td>
                  <td>{product.inventory_count || '0'}</td>
                  <td>
                    {product.competitor_urls?.length > 0 ? (
                      <span className="competitor-count">{product.competitor_urls.length} competitors</span>
                    ) : 'N/A'}
                  </td>
                  <td>{product.currency}</td>
                  <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td>{new Date(product.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-button edit-button">
                        <FaEdit />
                      </button>
                      <button className="action-button delete-button">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;