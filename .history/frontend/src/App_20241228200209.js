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
          import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainNav from './components/Navigation/MainNav';
import Products from './components/Products/Products';
import AddProduct from './components/Products/AddProduct';
import GenerateContent from './components/Content/GenerateContent';
import SocialMediaCampaigns from './components/SocialMedia/SocialMediaCampaigns';
import ProductChatbot from './components/Chatbot/ProductChatbot';
import CompleteListings from './components/Listings/CompleteListings';

function App() {
  return (
    <Router>
      <div className="App">
        <MainNav />
        <main>
          <Routes>
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/content/generate" element={<GenerateContent />} />
            <Route path="/social-media" element={<SocialMediaCampaigns />} />
            <Route path="/chatbot" element={<ProductChatbot />} />
            <Route path="/listings" element={<CompleteListings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
        </Routes>
      </div>
    </Router>
  );
}

export default App;