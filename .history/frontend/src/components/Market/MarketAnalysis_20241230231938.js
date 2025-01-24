import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeTrends, getDynamicPricing, getBundleRecommendations } from '../../services/marketAnalysis';
import { getProducts } from '../../services/products';
import './MarketAnalysis.css';

const MarketAnalysis = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [analysisType, setAnalysisType] = useState('trends');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      switch (analysisType) {
        case 'trends':
          response = await analyzeTrends(selectedProduct, 'current');
          setResult(response.analysis);
          break;
        case 'pricing':
          response = await getDynamicPricing(selectedProduct, {
            target_margin: 30,
            market_demand: 'normal',
            season: 'current'
          });
          setResult(response.pricing_strategy);
          break;
        case 'bundles':
          response = await getBundleRecommendations([selectedProduct], {
            target_audience: 'general',
            price_range: 'medium',
            season: 'current'
          });
          setResult(response.bundle_recommendations);
          break;
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-analysis-container">
      <h2>Market Analysis Tools</h2>
      
      <div className="analysis-controls">
        <select 
          value={selectedProduct} 
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Select a Product</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>

        <select 
          value={analysisType} 
          onChange={(e) => setAnalysisType(e.target.value)}
        >
          <option value="trends">Market Trends</option>
          <option value="pricing">Dynamic Pricing</option>
          <option value="bundles">Bundle Recommendations</option>
        </select>

        <button 
          onClick={handleAnalysis} 
          disabled={loading || !selectedProduct}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="analysis-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;