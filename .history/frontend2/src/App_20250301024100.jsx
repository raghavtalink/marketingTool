import React from 'react';
import {  Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/Features';
import PricingTable from './pages/Pricing';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutUs';
import RegisterPage from './pages/Register';



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
        </Routes>
      </div>
    
  );
}

export default App;
