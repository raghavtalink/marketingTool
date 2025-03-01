import React from 'react';
import {  Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';

import Navbar from "./components/Navbar";
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/Features';
import PricingTable from './pages/Pricing';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutUs';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Check if token is expired
      try {
        // Simple token expiration check
        // For JWT tokens, you would decode and check the exp claim
        // This is a simplified version
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const isExpired = tokenData.exp * 1000 < Date.now();
        
        if (isExpired) {
          // Token expired, clear localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenType');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        // If there's an error parsing the token, consider it invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      {/* Only show Navbar if not on dashboard */}
      {!isDashboard && <Navbar />}
      
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingTable />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
