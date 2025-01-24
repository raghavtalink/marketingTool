import React, { useState } from 'react';
import { analyzeTrends } from '../../services/marketAnalysis';
import ProductSelector from '../unco';
import TimeframeSelector from './TimeFrameSelector'; 
import TrendChart from './charts/TrendChart';  
import './MarketTrends.css';

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

export default MarketTrends;