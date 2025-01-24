// src/components/Layout/Navbar.js
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            <li>
              <Link to="/social-media">Social Media Campaigns</Link>
            </li>
            <li>
              <Link to="/chatbot">Product Chatbot</Link>
            </li>
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
