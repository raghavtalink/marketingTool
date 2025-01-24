// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
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
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import MarketTrends from './components/MarketTrends/MarketTrends';
import BundleAnalysis from './components/BundleAnalysis/BundleAnalysis';
import './App.css';





function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <ProductList />
              </PrivateRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <PrivateRoute>
                <ProductCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/content/generate"
            element={
              <PrivateRoute>
                <ContentGenerate />
              </PrivateRoute>
            }
          />
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
          <Route path="/" element={<Login />} />
          <Route path="/social-media/create" element={<CampaignCreate />} />
          <Route path="/social-media/campaigns" element={<CampaignList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/chatbot" element={<ProductChatbot />} />
          <Route path="/social-media" element={<SocialMediaCampaigns />} />          
        </Routes>
      </div>
    </Router>
  );
}

export default App;