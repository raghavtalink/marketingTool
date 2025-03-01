import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/Pricing';
import FeaturesPage from './pages/Features';
import AboutPage from './pages/About';
import BlogPage from './pages/Blog';
import ContactPage from './pages/Contact';
import NotFoundPage from './pages/NotFound';

// NavbarWrapper component to conditionally render Navbar
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
    <Router>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
