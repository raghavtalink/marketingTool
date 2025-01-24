// frontend/src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaBars, FaTimes, FaHome, FaBoxOpen, FaChartLine, FaBullhorn, FaComments, FaTags, FaChartPie, FaPenNib } from 'react-icons/fa';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="sidebar-brand">SaaS App</h2>}
        <button className="toggle-button" onClick={toggleSidebar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link" activeClassName="active">
          <FaHome className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Dashboard</span>}
        </NavLink>
        <NavLink to="/products" className="nav-link" activeClassName="active">
          <FaBoxOpen className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Products</span>}
        </NavLink>
        {/* <NavLink to="/analytics" className="nav-link" activeClassName="active">
          <FaChartLine className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Analytics</span>}
        </NavLink> */}
        <NavLink to="/campaigns" className="nav-link" activeClassName="active">
          <FaBullhorn className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Campaigns</span>}
        </NavLink>
        <NavLink to="/dynamic-pricing" className="nav-link" activeClassName="active">
          <FaTags className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Dynamic Pricing</span>}
        </NavLink>
        <NavLink to="/bundles" className="nav-link" activeClassName="active">
          <FaChartPie className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Bundles</span>}
        </NavLink>
        <NavLink to="/market-trends" className="nav-link" activeClassName="active">
          <FaPenNib className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Market Trends</span>}
        </NavLink>
        <NavLink to="/content-generation" className="nav-link" activeClassName="active">
          <FaComments className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Content Generation</span>}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;