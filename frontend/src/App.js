import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './components/Auth/PrivateRoute';
import PublicRoute from './components/Auth/PublicRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductCreate from './components/Products/ProductCreate';
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import Bundles from './components/Bundles/Bundles';
import MarketTrends from './components/MarketTrends/MarketTrends';
import ContentGenerate from './components/Content/ContentGenerate';
import Campaigns from './components/Campaigns/Campaigns';
import ProductChatbot from './components/Chatbot/ProductChatbot';
import ImageEditor from './components/ImageEditor/ImageEditor';
import LandingPage from './components/LandingPage/LandingPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/dynamic-pricing" element={<DynamicPricing />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/market-trends" element={<MarketTrends />} />
          <Route path="/content-generation" element={<ContentGenerate />} />
          <Route path="/chatbot" element={<ProductChatbot />} />
          <Route path="/image-editor" element={<ImageEditor />} />
        </Route>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;