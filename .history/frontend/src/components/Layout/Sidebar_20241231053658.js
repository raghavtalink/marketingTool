import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiMegaphone, FiDollarSign, FiPackage, FiTrendingUp, FiCpu, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <nav>
                <NavLink to="/dashboard">
                    <FiHome />
                    {!isCollapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/products">
                    <FiBox />
                    {!isCollapsed && <span>Products</span>}
                </NavLink>
                <NavLink to="/campaigns">
                    <FiStar />
                    {!isCollapsed && <span>Campaigns</span>}
                </NavLink>
                <NavLink to="/dynamic-pricing">
                    <FiDollarSign />
                    {!isCollapsed && <span>Dynamic Pricing</span>}
                </NavLink>
                <NavLink to="/bundles">
                    <FiPackage />
                    {!isCollapsed && <span>Bundles</span>}
                </NavLink>
                <NavLink to="/market-trends">
                    <FiTrendingUp />
                    {!isCollapsed && <span>Market Trends</span>}
                </NavLink>
                <NavLink to="/content-generation">
                    <FiCpu />
                    {!isCollapsed && <span>Content Generation</span>}
                </NavLink>
                <button onClick={handleLogout} className="logout-button">
                    <FiLogOut />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;