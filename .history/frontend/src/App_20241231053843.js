// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Auth/PrivateRoute';
import PublicRoute from './components/Auth/PublicRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Campaigns from './components/Campaigns/Campaigns';
import Products from './components/Products/Products';
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import Bundles from './components/Bundles/Bundles';
import MarketTrends from './components/MarketTrends/MarketTrends';
import ContentGeneration from './components/ContentGeneration/ContentGeneration';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />

                {/* Private Routes */}
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/campaigns" element={<Campaigns />} />
                                <Route path="/dynamic-pricing" element={<DynamicPricing />} />
                                <Route path="/bundles" element={<Bundles />} />
                                <Route path="/market-trends" element={<MarketTrends />} />
                                <Route path="/content-generation" element={<ContentGeneration />} />
                            </Routes>
                        </Layout>
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;