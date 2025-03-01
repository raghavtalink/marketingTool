import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingTable from './pages/PricingTable';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';

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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
