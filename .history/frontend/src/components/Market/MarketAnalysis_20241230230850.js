import React, { useState, useEffect } from 'react';
import { analyzeTrends, getDynamicPricing, getBundleRecommendations } from '../../services/marketAnalysis';
import { getProducts } from '../../services/products';

const MarketAnalysis = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [analysisType, setAnalysisType] = useState('market_position');
  const [timeframe, setTimeframe] = useState('current');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const result = await analyzeTrends(selectedProduct, analysisType, timeframe);
      setAnalysis(result.analysis);
    } catch (err) {
      setError('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-analysis">
      <h2>Market Analysis Dashboard</h2>
      
      <div className="analysis-controls">
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>{product.name}</option>
          ))}
        </select>

        <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
          <option value="market_position">Market Position</option>
          <option value="competitor_analysis">Competitor Analysis</option>
          <option value="demand_forecast">Demand Forecast</option>
        </select>

        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="current">Current</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <button onClick={handleAnalysis} disabled={loading || !selectedProduct}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {analysis && (
        <div className="analysis-results">
          <pre>{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;