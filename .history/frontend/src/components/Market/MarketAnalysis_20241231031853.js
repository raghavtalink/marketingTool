import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { getDynamicPricing, analyzeTrends, getBundleRecommendations } from '../../services/marketAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DynamicPricing from './DynamicPricing';
import { formatCurrency } from '../../uti';
import './MarketAnalysis.css';

// Product Selector Component
const ProductSelector = ({ selectedProduct, onSelect }) => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="selector-group">
      <label>Select Product</label>
      <select value={selectedProduct} onChange={(e) => onSelect(e.target.value)}>
        <option value="">Choose a product...</option>
        {products.map(product => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// TimeframeSelector Component
const TimeframeSelector = ({ timeframe, onChange }) => (
  <div className="selector-group">
    <label>Time Period</label>
    <select value={timeframe} onChange={(e) => onChange(e.target.value)}>
      <option value="current">Current</option>
      <option value="3_months">Last 3 Months</option>
      <option value="6_months">Last 6 Months</option>
      <option value="1_year">Last Year</option>
    </select>
  </div>
);

// TrendChart Component
const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
          <Line type="monotone" dataKey="marketAverage" stroke="#82ca9d" name="Market Average" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// BundleCard Component
const BundleCard = ({ bundle }) => (
  <div className="bundle-card">
    <h3>{bundle.name}</h3>
    <p className="bundle-price">{formatCurrency(bundle.total_price)}</p>
    <ul className="bundle-products">
      {bundle.products?.map((product, index) => (
        <li key={index}>
          {product.name} - {formatCurrency(product.price)}
        </li>
      ))}
    </ul>
    {bundle.savings && (
      <p className="bundle-savings">Save {formatCurrency(bundle.savings)}!</p>
    )}
  </div>
);

// Market Trends Component
const MarketTrends = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [timeframe, setTimeframe] = useState('current');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const data = await analyzeTrends(selectedProduct, 'market_position', timeframe);
      setTrendData(data);
    } catch (err) {
      setError('Failed to analyze market trends');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="market-trends">
      <h2>Market Trends Analysis</h2>
      <div className="analysis-controls">
        <ProductSelector selectedProduct={selectedProduct} onSelect={setSelectedProduct} />
        <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
        <button onClick={handleAnalysis} disabled={loading || !selectedProduct}>
          {loading ? 'Analyzing...' : 'Analyze Trends'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {trendData && (
        <div className="trend-results">
          <TrendChart data={trendData.trends} />
          <div className="trend-insights">
            <h3>Market Insights</h3>
            <ul>
              {trendData.insights?.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Bundle Analysis Component
const BundleAnalysis = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products');
      return;
    }
    setLoading(true);
    try {
      const data = await getBundleRecommendations(selectedProducts);
      setBundleData(data);
    } catch (err) {
      setError('Failed to generate bundle recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bundle-analysis">
      <h2>Product Bundle Analysis</h2>
      <div className="analysis-controls">
        <ProductSelector 
          selectedProduct={selectedProducts} 
          onSelect={(value) => setSelectedProducts(prev => [...prev, value])} 
        />
        <button onClick={handleAnalysis} disabled={loading || selectedProducts.length < 2}>
          {loading ? 'Analyzing...' : 'Get Bundle Recommendations'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {bundleData && (
        <div className="bundle-results">
          {bundleData.recommendations?.map((bundle, index) => (
            <BundleCard key={index} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Market Analysis Component
const MarketAnalysis = () => {
  return (
    <div className="market-analysis-container">
      <nav className="analysis-nav">
        <NavLink to="/market/pricing" className={({ isActive }) => 
          isActive ? 'nav-link active' : 'nav-link'}>
          Dynamic Pricing
        </NavLink>
        <NavLink to="/market/trends" className={({ isActive }) => 
          isActive ? 'nav-link active' : 'nav-link'}>
          Market Trends
        </NavLink>
        <NavLink to="/market/bundles" className={({ isActive }) => 
          isActive ? 'nav-link active' : 'nav-link'}>
          Bundle Analysis
        </NavLink>
      </nav>

      <div className="analysis-content">
        <Routes>
          <Route path="/pricing" element={<DynamicPricing />} />
          <Route path="/trends" element={<MarketTrends />} />
          <Route path="/bundles" element={<BundleAnalysis />} />
          <Route path="/" element={<DynamicPricing />} />
        </Routes>
      </div>
    </div>
  );
};

export default MarketAnalysis;