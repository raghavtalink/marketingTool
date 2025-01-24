import React, { useState, useEffect } from 'react';
import { getDynamicPricing } from '../../services/marketAnalysis';
import { getProducts } from '../../services/products';
import { formatCurrency } from './formatters';
import './MarketAnalysis.css';

const MarketAnalysis = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [analysisType, setAnalysisType] = useState('pricing');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [error, setError] = useState('');
  const [pricingData, setPricingData] = useState({
    target_margin: 30,
    competitor_prices: [0],
    market_demand: 'normal',
    season: 'current'
  });

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

  const handlePricingDataChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: field === 'competitor_prices' ? [Number(value)] : value
    }));
  };

  const handleAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDynamicPricing(selectedProduct, pricingData);
      console.log('API Response:', response);
      setResult(response.pricing_strategy);
      if (response.competitors && Array.isArray(response.competitors)) {
        console.log('Setting competitors:', response.competitors);
        setCompetitors(response.competitors);
      } else {
        console.warn('No valid competitors data received');
        setCompetitors([]);
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCompetitors = () => {
    if (!competitors.length) return null;

    return (
      <div className="competitors-section">
        <h3>Found Competitors</h3>
        <div className="competitors-grid">
          {competitors.map((comp, index) => (
            <div key={index} className="competitor-card">
              <h4>{comp.name}</h4>
              <p className="price">
                {formatCurrency(comp.price, comp.currency)}
              </p>
              {comp.url && (
                <a href={comp.url} target="_blank" rel="noopener noreferrer">
                  View Product
                </a>
              )}
              {comp.features && (
                <ul className="features-list">
                  {comp.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="market-analysis-container">
      <h2>Dynamic Pricing Analysis</h2>
      
      <div className="analysis-controls">
        <div className="input-group">
          <label htmlFor="product-select">Select Product</label>
          <select 
            id="product-select"
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Choose a product...</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pricing-controls">
          <div className="input-group">
            <label htmlFor="target-margin">Target Profit Margin (%)</label>
            <input
              id="target-margin"
              type="number"
              value={pricingData.target_margin}
              onChange={(e) => handlePricingDataChange('target_margin', Number(e.target.value))}
              title="Your desired profit margin percentage"
            />
          </div>

          <div className="input-group">
            <label htmlFor="market-demand">Market Demand</label>
            <select
              id="market-demand"
              value={pricingData.market_demand}
              onChange={(e) => handlePricingDataChange('market_demand', e.target.value)}
              title="Select the current market demand level"
            >
              <option value="low">Low Demand (Buyer's Market)</option>
              <option value="normal">Normal Demand (Balanced)</option>
              <option value="high">High Demand (Seller's Market)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="season">Target Season</label>
            <select
              id="season"
              value={pricingData.season}
              onChange={(e) => handlePricingDataChange('season', e.target.value)}
              title="Select the season for pricing analysis"
            >
              <option value="current">Current Season</option>
              <option value="spring">Spring Season</option>
              <option value="summer">Summer Season</option>
              <option value="fall">Fall Season</option>
              <option value="winter">Winter Season</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleAnalysis} 
          disabled={loading || !selectedProduct}
          className="analyze-button"
        >
          {loading ? 'Analyzing...' : 'Analyze Pricing'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {competitors && competitors.length > 0 && (
        <div className="competitors-section">
          <h3>Found Competitors</h3>
          <div className="competitors-grid">
            {competitors.map((comp, index) => (
              <div key={index} className="competitor-card">
                <h4>{comp.name}</h4>
                <p className="price">
                  {formatCurrency(comp.price, comp.currency)}
                </p>
                {comp.url && (
                  <a href={comp.url} target="_blank" rel="noopener noreferrer">
                    View Product
                  </a>
                )}
                {comp.features && comp.features.length > 0 && (
                  <ul className="features-list">
                    {comp.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="analysis-result">
          <h3>Pricing Analysis</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;