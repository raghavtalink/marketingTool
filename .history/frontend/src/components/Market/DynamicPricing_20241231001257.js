import React, { useState } from 'react';
import { getDynamicPricing } from '../../services/marketAnalysis';
import ProductSelector from '../Common';
import { formatCurrency } from './formatters';

const DynamicPricing = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricingData, setPricingData] = useState(null);

  const handleAnalysis = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const data = await getDynamicPricing(selectedProduct, {
        target_margin: 30, // Default margin
        competitor_prices: [],
        market_demand: 'normal',
        season: 'current'
      });
      setCompetitors(data.competitors || []);
      setPricingData(data.pricing_analysis || null);
    } catch (err) {
      setError('Failed to analyze pricing');
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
    );
  };

  return (
    <div className="dynamic-pricing">
      <h2>Dynamic Pricing Analysis</h2>

      <div className="analysis-controls">
        <ProductSelector
          selectedProduct={selectedProduct}
          onSelect={setSelectedProduct}
        />

        <button
          onClick={handleAnalysis}
          disabled={loading || !selectedProduct}
          className="analyze-button"
        >
          {loading ? 'Analyzing...' : 'Analyze Pricing'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {renderCompetitors()}

      {pricingData && (
        <div className="pricing-analysis">
          <h3>Pricing Analysis</h3>
          <div className="analysis-content">
            {/* Render pricing analysis data */}
            <pre>{JSON.stringify(pricingData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPricing;