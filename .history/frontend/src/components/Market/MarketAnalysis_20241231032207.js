// import React from 'react';
// import { Routes, Route, NavLink } from 'react-router-dom';
// import DynamicPricing from './DynamicPricing';
// import MarketTrends from './MarketTrends';
// import BundleAnalysis from './BundleAnalysis';
// import './MarketAnalysis.css';

// const MarketAnalysis = () => {
//   return (
//     <div className="market-analysis-container">
//       <nav className="analysis-nav">
//         <NavLink 
//           to="/market/pricing" 
//           className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
//         >
//           Dynamic Pricing
//         </NavLink>
//         <NavLink 
//           to="/market/trends" 
//           className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
//         >
//           Market Trends
//         </NavLink>
//         <NavLink 
//           to="/market/bundles" 
//           className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
//         >
//           Bundle Analysis
//         </NavLink>
//       </nav>

//       <div className="analysis-content">
//         <Routes>
//           <Route path="/pricing" element={<DynamicPricing />} />
//           <Route path="/trends" element={<MarketTrends />} />
//           <Route path="/bundles" element={<BundleAnalysis />} />
//           <Route path="/" element={<DynamicPricing />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default MarketAnalysis;


// frontend/src/components/Market/MarketAnalysis.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { getDynamicPricing, analyzeTrends, getBundleRecommendations, getProducts } from '../../services/marketAnalysis'; // Ensure these services are correctly implemented
import { formatCurrency } from './formatters'; // Ensure this utility is correctly implemented
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './MarketAnalysis.css';

// Common Components
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

const TimeframeSelector = ({ timeframe, onChange }) => {
  return (
    <div className="selector-group">
      <label htmlFor="timeframe-select">Time Period</label>
      <select
        id="timeframe-select"
        value={timeframe}
        onChange={(e) => onChange(e.target.value)}
        className="selector-input"
      >
        <option value="current">Current</option>
        <option value="3_months">Last 3 Months</option>
        <option value="6_months">Last 6 Months</option>
        <option value="1_year">Last Year</option>
      </select>
    </div>
  );
};

// TrendChart Component
const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={400}>
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
const BundleCard = ({ bundle }) => {
  return (
    <div className="bundle-card">
      <h3>{bundle.name}</h3>
      <div className="bundle-price">
        {formatCurrency(bundle.total_price, bundle.currency)}
      </div>
      <div className="bundle-products">
        <h4>Included Products:</h4>
        <ul>
          {bundle.products?.map((product, index) => (
            <li key={index}>
              {product.name} - {formatCurrency(product.price, product.currency)}
            </li>
          ))}
        </ul>
      </div>
      {bundle.savings && (
        <div className="bundle-savings">
          Save {formatCurrency(bundle.savings, bundle.currency)}!
        </div>
      )}
    </div>
  );
};

// DynamicPricing Component
const DynamicPricing = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricingData, setPricingData] = useState(null);
  const [analysisParams, setAnalysisParams] = useState({
    target_margin: 30,
    market_demand: 'normal',
    season: 'current'
  });

  const handleParamChange = (e) => {
    setAnalysisParams({
      ...analysisParams,
      [e.target.name]: e.target.value
    });
  };

  const handleAnalysis = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    try {
      const data = await getDynamicPricing(selectedProduct, {
        ...analysisParams,
        competitor_prices: []
      });
      setCompetitors(data.competitors || []);
      setPricingData(data.pricing_analysis || null);
    } catch (err) {
      setError('Failed to analyze pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dynamic-pricing">
      <h2>Dynamic Pricing Analysis</h2>

      <div className="analysis-controls">
        <ProductSelector
          selectedProduct={selectedProduct}
          onSelect={setSelectedProduct}
        />

        <div className="params-group">
          <div className="param-control">
            <label>Target Margin (%)</label>
            <input
              type="number"
              name="target_margin"
              value={analysisParams.target_margin}
              onChange={handleParamChange}
              min="0"
              max="100"
            />
          </div>

          <div className="param-control">
            <label>Market Demand</label>
            <select
              name="market_demand"
              value={analysisParams.market_demand}
              onChange={handleParamChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="param-control">
            <label>Season</label>
            <select
              name="season"
              value={analysisParams.season}
              onChange={handleParamChange}
            >
              <option value="current">Current</option>
              <option value="peak">Peak</option>
              <option value="off">Off-Season</option>
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

      <div className="analysis-results">
        <div className="competitors-section">
          <h3>Found Competitors</h3>
          <div className="competitors-grid">
            {competitors.map((comp, index) => (
              <div key={index} className="competitor-card">
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
            ))}
          </div>
        </div>

        {pricingData && (
          <div className="pricing-analysis">
            <h3>Pricing Analysis</h3>
            <div className="analysis-content">
              <div className="recommendation-card">
                <h4>Recommended Price Range</h4>
                <p className="price-range">
                  {formatCurrency(pricingData.min_price)} - {formatCurrency(pricingData.max_price)}
                </p>
                <div className="analysis-details">
                  {pricingData.recommendations.map((rec, index) => (
                    <p key={index}>{rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// MarketTrends Component
const MarketTrends = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [timeframe, setTimeframe] = useState('current');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
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
        <ProductSelector
          selectedProduct={selectedProduct}
          onSelect={setSelectedProduct}
        />
        
        <TimeframeSelector
          timeframe={timeframe}
          onChange={setTimeframe}
        />

        <button 
          onClick={handleAnalysis}
          disabled={loading || !selectedProduct}
          className="analyze-button"
        >
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

// BundleAnalysis Component
const BundleAnalysis = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (selectedProducts.length < 2) {
      setError('Please select at least 2 products for bundle analysis');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getBundleRecommendations(selectedProducts, {
        target_audience: 'general',
        price_range: 'medium',
        season: 'current'
      });
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
        <ProductMultiSelector
          selectedProducts={selectedProducts}
          onChange={setSelectedProducts}
          minSelection={2}
        />

        <button
          onClick={handleAnalysis}
          disabled={loading || selectedProducts.length < 2}
          className="analyze-button"
        >
          {loading ? 'Analyzing...' : 'Get Bundle Recommendations'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bundleData && (
        <div className="bundle-results">
          {bundleData.recommendations.map((bundle, index) => (
            <BundleCard key={index} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main MarketAnalysis Component
const MarketAnalysis = () => {
  return (
    <div className="market-analysis-container">
      <nav className="analysis-nav">
        <NavLink 
          to="/market/pricing" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Dynamic Pricing
        </NavLink>
        <NavLink 
          to="/market/trends" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Market Trends
        </NavLink>
        <NavLink 
          to="/market/bundles" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
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