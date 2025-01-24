// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/Auth/PrivateRoute';
import PublicRoute from './components/Auth/PublicRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductCreate from './components/Products/ProductCreate';
import DynamicPricing from './components/DynamicPricing/DynamicPricing';
import Bundles from './components/Bundles/Bundles';
import MarketTrends from './components/MarketTrends/MarketTrends';
import './App.css';
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
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/produ" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/campaigns" element={<Campaigns />} />
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
                                            <ContentGenerate />
                                        </PrivateRoute>
                                    }
                                />
                            </Routes>
                        </Layout>
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;