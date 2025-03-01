import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Package, 
  Box, 
  Lightbulb, 
  DollarSign, 
  Camera, 
  TrendingUp, 
  Megaphone,
  Menu,
  X,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import components for each feature (to be created later)
import ListingWizard from '../components/dashboard/ListingWizard';
// import BundleBuilder from '../components/dashboard/BundleBuilder';
// import ProductGenius from '../components/dashboard/ProductGenius';
// import PricePilot from '../components/dashboard/PricePilot';
// import InstantStudio from '../components/dashboard/InstantStudio';
// import TrendSpot from '../components/dashboard/TrendSpot';
// import AdCrafter from '../components/dashboard/AdCrafter';
// import DashboardHome from '../components/dashboard/DashboardHome';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Features configuration
  const features = [
    { id: 'home', name: 'Dashboard', icon: <Home size={20} /> },
    { id: 'listing-wizard', name: 'Listing Wizard', icon: <Package size={20} /> },
    { id: 'bundle-builder', name: 'Bundle Builder', icon: <Box size={20} /> },
    { id: 'product-genius', name: 'Product Genius', icon: <Lightbulb size={20} /> },
    { id: 'price-pilot', name: 'Price Pilot', icon: <DollarSign size={20} /> },
    { id: 'instant-studio', name: 'Instant Studio', icon: <Camera size={20} /> },
    { id: 'trendspot', name: 'TrendSpot', icon: <TrendingUp size={20} /> },
    { id: 'ad-crafter', name: 'Ad Crafter', icon: <Megaphone size={20} /> },
  ];
  
  // Render the active feature component
  const renderFeature = () => {
    switch(activeFeature) {
      case 'listing-wizard':
        return <ListingWizard />;
      case 'bundle-builder':
        return <BundleBuilder />;
      case 'product-genius':
        return <ProductGenius />;
      case 'price-pilot':
        return <PricePilot />;
      case 'instant-studio':
        return <InstantStudio />;
      case 'trendspot':
        return <TrendSpot />;
      case 'ad-crafter':
        return <AdCrafter />;
      case 'home':
      default:
        return <DashboardHome />;
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    navigate('/login');
  };
  
  // Background blob animations
  const BlobAnimation = ({ delay, className }) => {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.1, 0.9, 1],
          x: [0, 30, -20, 0],
          y: [0, -50, 20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 20,
          delay: delay,
          ease: "easeInOut"
        }}
        className={className}
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-black text-gray-100 flex">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-10">
        <BlobAnimation 
          delay={0}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation 
          delay={5}
          className="absolute top-0 -right-20 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation 
          delay={2.5}
          className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>
      
      {/* Mobile sidebar toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <motion.div 
        className={`fixed lg:relative z-30 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 ${
              !sidebarOpen && 'lg:hidden'
            }`}>
              SELLOVATE
            </h1>
            {!sidebarOpen && (
              <h1 className="hidden lg:block text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                S
              </h1>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-4">
              {features.map((feature) => (
                <li key={feature.id}>
                  <button
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeFeature === feature.id 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="flex-shrink-0">{feature.icon}</span>
                    {sidebarOpen && <span className="ml-3">{feature.name}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <User size={20} />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
              )}
            </div>
            
            <div className={`mt-4 flex ${!sidebarOpen ? 'lg:flex-col lg:items-center' : 'space-x-2'}`}>
              <button 
                onClick={() => setActiveFeature('settings')}
                className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main content */}
      <motion.div 
        className="flex-1 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6 lg:p-10 h-full">
          {renderFeature()}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;