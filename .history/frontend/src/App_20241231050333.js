// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductCreate from './components/Products/ProductCreate';
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import Bundles from './components/Bundles/Bundles';
import MarketTrends from './components/MarketTrends/MarketTrends';
import Campaigns from './components/Campaigns/Campaigns';
import PrivateRoute from './components/Common/PrivateRoute';
import './App.css';
import ContentGenerate from './components/Content/ContentGenerate';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="main-content">
        <Routes>
          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
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
          <Route path="/campaigns" element={<Campaigns />} />
          <Route
            path="/dynamic-pricing"
            element={
              <PrivateRoute>
                <DynamicPricing />
              </PrivateRoute>
            }
          />
          <Route
            path="/bundles"
            element={
              <PrivateRoute>
                <Bundles />
              </PrivateRoute>
            }
          />
          <Route
            path="/market-trends"
            element={
              <PrivateRoute>
                <MarketTrends />
              </PrivateRoute>
            }
          />
          <Route
            path="/content-generation"
            element={
              <PrivateRoute>
                <ContentGeneration />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;