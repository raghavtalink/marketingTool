import React from 'react';
import {  Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/Features';
import PricingTable from './pages/Pricing';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutUs';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';


const NavbarWrapper = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/dashboard'];
  
  // Check if current path should hide navbar
  const shouldHideNavbar = hideNavbarPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  return shouldHideNavbar ? null : <Navbar />;
};


function App() {
  return (
  
      <div className="h-auto bg-black">
        <Navbar />
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
      </div>
    
  );
}

export default App;
