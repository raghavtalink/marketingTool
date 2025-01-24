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
          <Route path="/" element={<Login />} />
          <Route path="/social-media/create" element={<CampaignCreate />} />
          <Route path="/social-media/campaigns" element={<CampaignList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/chatbot" element={<ProductChatbot />} />          
        </Routes>
      </div>
    </Router>
  );
}

export default App;