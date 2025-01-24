import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DynamicPricing from './DynamicPricing';
import MarketTrends from './MarketTrends';
import BundleAnalysis from '.';
import './MarketAnalysis.css';

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