// frontend/src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaBars, FaTimes, FaHome, FaProductHunt, FaRegChartBar, FaClipboardList, FaComments } from 'react-icons/fa';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-brand">SaaS App</h2>
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link" activeClassName="active">
          <FaHome className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </NavLink>
        <NavLink to="/products" className="nav-link" activeClassName="active">
          <FaProductHunt className="nav-icon" />
          <span className="nav-text">Products</span>
        </NavLink>
        <NavLink to="/analytics" className="nav-link" activeClassName="active">
          <FaRegChartBar className="nav-icon" />
          <span className="nav-text">Analytics</span>
        </NavLink>
        <NavLink to="/campaigns" className="nav-link" activeClassName="active">
          <FaClipboardList className="nav-icon" />
          <span className="nav-text">Campaigns</span>
        </NavLink>
        <NavLink to="/chatbot" className="nav-link" activeClassName="active">
          <FaComments className="nav-icon" />
          <span className="nav-text">Chatbot</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;