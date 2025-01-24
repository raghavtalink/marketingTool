// src/components/BundleAnalysis/BundleAnalysis.js

import React, { useState } from 'react';
import { getBundleRecommendations } from '../../services/marketAnalysis';
import ProductMultiSelector from '../Common/ProductMultiSelector';
import BundleCard from './BundleCard';
import './BundleAnalysis.css';

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

      {bundleData && bundleData.recommendations && (
  <div className="bundle-results">
    {bundleData.recommendations.map((bundle, index) => (
      <BundleCard key={index} bundle={bundle} />
    ))}
  </div>
)}
    </div>
  );
};

export default BundleAnalysis;