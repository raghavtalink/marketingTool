import React, { useState } from 'react';
import { getDynamicPricing } from '../../services/marketAnalysis';
import ProductSelector from '../uncommon/ProductSelector';
import { formatCurrency } from './formatters';


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

export default DynamicPricing;