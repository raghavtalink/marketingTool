import React, { useState, useEffect } from 'react';
import { getDynamicPricing, analyzeTrends, getBundleRecommendations } from '../../services/marketAnalysis';
import { getProducts } from '../../services/products';
import './MarketAnalysis.css';
import { formatCurrency } from './formatters';

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
  const [trendData, setTrendData] = useState(null);
  const [bundleData, setBundleData] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [timeframe, setTimeframe] = useState('current');

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
      setResult(response.pricing_strategy);
      setCompetitors(response.competitors || []);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeTrends(selectedProduct, 'market_position', timeframe);
      setTrendData(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze trends');
    } finally {
      setLoading(false);
    }
  };

  const handleBundleAnalysis = async () => {
    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products for bundle analysis');
      return;
    }
    setLoading(true);
    try {
      const response = await getBundleRecommendations(selectedProducts, {
        target_audience: 'general',
        price_range: 'medium',
        season: 'current'
      });
      setBundleData(response);
    } catch (err) {
      setError(err.message || 'Failed to get bundle recommendations');
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
            <CompetitorCard key={index} comp={comp} />
          ))}
        </div>
      </div>
    );
  };

  const CompetitorCard = ({ comp }) => (
    <div className="competitor-card">
      <h4>{comp.name}</h4>
      <p className="price">
        {formatCurrency(comp.price, comp.currency || 'USD')}
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
  );

  const renderAnalysisControls = () => {
    return (
      <div className="analysis-type-selector">
        <select 
          value={analysisType} 
          onChange={(e) => setAnalysisType(e.target.value)}
        >
          <option value="pricing">Dynamic Pricing</option>
          <option value="trends">Market Trends</option>
          <option value="bundles">Product Bundles</option>
        </select>

        {analysisType === 'trends' && (
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="current">Current</option>
            <option value="3_months">Last 3 Months</option>
            <option value="6_months">Last 6 Months</option>
            <option value="1_year">Last Year</option>
          </select>
        )}

        {analysisType === 'bundles' && (
          <select 
            multiple
            value={selectedProducts}
            onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="market-analysis-container">
      <h2>Market Analysis</h2>
      
      {renderAnalysisControls()}
      
      <button 
        onClick={() => {
          switch(analysisType) {
            case 'pricing':
              handleAnalysis();
              break;
            case 'trends':
              handleTrendAnalysis();
              break;
            case 'bundles':
              handleBundleAnalysis();
              break;
          }
        }}
        disabled={loading || (!selectedProduct && analysisType !== 'bundles')}
        className="analyze-button"
      >
        {loading ? 'Analyzing...' : `Analyze ${analysisType}`}
      </button>

      {error && <div className="error-message">{error}</div>}
      
      {analysisType === 'pricing' && renderCompetitors()}
      {analysisType === 'trends' && trendData && (
        <div className="trend-analysis">
          <h3>Market Trend Analysis</h3>
          <pre>{JSON.stringify(trendData, null, 2)}</pre>
        </div>
      )}
      {analysisType === 'bundles' && bundleData && (
        <div className="bundle-recommendations">
          <h3>Bundle Recommendations</h3>
          <pre>{bundleData.bundle_recommendations}</pre>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;