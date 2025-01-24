// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ProductList from './components/Products/ProductList';
import ProductCreate from './components/Products/ProductCreate';
import ContentGenerate from './components/Content/ContentGenerate';
import PrivateRoute from './components/Common/PrivateRoute';
import CampaignCreate from './components/SocialMedia/CampaignCreate';
import CampaignList from './components/SocialMedia/CampaignList';
import ProductDetails from './components/Products/ProductDetails';
import ProductChatbot from './components/Chatbot/ProductChatbot';
import SocialMediaCampaigns from './components/SocialMedia/SocialMediaCampaigns';
import MarketAnalysis from './components/Market/MarketAnalysis';

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