// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import MarketTrends from './components/MarketTrends/MarketTrends';
import BundleAnalysis from './components/BundleAnalysis/BundleAnalysis';
import './App.css'; // Optional: General app styling

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <NavLink 
            to="/pricing" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Dynamic Pricing
          </NavLink>
          <NavLink 
            to="/trends" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Market Trends
          </NavLink>
          <NavLink 
            to="/bundles" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Bundle Analysis
          </NavLink>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/pricing" element={<DynamicPricing />} />
            <Route path="/trends" element={<MarketTrends />} />
            <Route path="/bundles" element={<BundleAnalysis />} />
            <Route path="/" element={<DynamicPricing />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;