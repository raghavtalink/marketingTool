import React, { useEffect, useState } from 'react';
import { getProductById } from '../../services/products';
import ProductChatbot from '../Chatbot/ProductChatbot';

const ProductDetails = ({ match }) => {
  const productId = match.params.id;
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product details');
      }
    };
    fetchProduct();
  }, [productId]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details-container">
      <h2>{product.name}</h2>
      {/* Display other product details */}
      
      <ProductChatbot product_id={product.id} />
    </div>
  );
};

export default ProductDetails;