// src/components/Layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Marketing Tool</Link>
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>Marketing Tool</h1>
      <ul>
        {auth.token ? (
          <>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/products/create">Add Product</Link>
            </li>
            <li>
              <Link to="/content/generate">Generate Content</Link>
            </li>
            <li><Link to="/social-media">Social Media Campaigns</Link></li>
            <li><Link to="/chatbot">Product Chatbot</Link></li>
            <li>
              <button onClick={handleLogout} className="btn">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;