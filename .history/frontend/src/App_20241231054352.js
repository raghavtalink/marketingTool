// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
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
                
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="products/create" element={<ProductCreate />} />
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="dynamic-pricing" element={<DynamicPricing />} />
                    <Route path="bundles" element={<Bundles />} />
                    <Route path="market-trends" element={<MarketTrends />} />
                    <Route path="content-generation" element={<ContentGenerate />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;