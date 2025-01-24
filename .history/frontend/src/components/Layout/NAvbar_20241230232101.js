// src/components/Layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Marketing Tool</Link>
      </div>
      <div className="nav-links">
        <Link to="/products">Products</Link>
        <Link to="/content">Content Generation</Link>
        <Link to="/social-media">Social Media</Link>
        <Link to="/market-analysis">Market Analysis</Link>
      </div>
    </nav>
  );
};

export default Navbar;