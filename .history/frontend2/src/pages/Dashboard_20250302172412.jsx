import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import components for each feature
import ListingWizard from '../components/dashboard/ListingWizard';
import Products from '../components/dashboard/Products';
import BundleBuilder from '../components/dashboard/BundleBuilder';
 import ProductGenius from '../components/dashboard/ProductGenius';
 import PricePilot from '../components/dashboard/PricePilot';
// import InstantStudio from '../components/dashboard/InstantStudio';
// import TrendSpot from '../components/dashboard/TrendSpot';
// import AdCrafter from '../components/dashboard/AdCrafter';
// import DashboardHome from '../components/dashboard/DashboardHome';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Hide Navbar when Dashboard is mounted
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, close on mobile
      setSidebarOpen(!mobile ? true : false);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Features configuration
  const features = [
    { id: 'home', name: 'Dashboard', icon: <Home size={20} /> },
    { id: 'products', name: 'Your Products', icon: <ShoppingBag size={20} /> },
    { id: 'listing-wizard', name: 'Listing Wizard', icon: <Package size={20} /> },
    { id: 'bundle-builder', name: 'Bundle Builder', icon: <Box size={20} /> },
    { id: 'product-genius', name: 'Product Genius', icon: <Lightbulb size={20} /> },
    { id: 'price-pilot', name: 'Price Pilot', icon: <DollarSign size={20} /> },
    { id: 'instant-studio', name: 'Instant Studio', icon: <Camera size={20} /> },
    { id: 'trendspot', name: 'TrendSpot', icon: <TrendingUp size={20} /> },
    { id: 'ad-crafter', name: 'Ad Crafter', icon: <Megaphone size={20} /> },
  ];
  
  // Handle feature selection
  const handleFeatureSelect = (featureId) => {
    setActiveFeature(featureId);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  // Render the active feature component
  const renderFeature = () => {
    switch(activeFeature) {
      case 'products':
        return <Products />;
      case 'listing-wizard':
        return <ListingWizard />;
        case 'product-genius':
        return <ProductGenius />;
        case 'price-pilot':
        return <PricePilot />;
      case 'bundle-builder':
        return <BundleBuilder />;
    //   case 'instant-studio':
    //     return <InstantStudio />;
    //   case 'trendspot':
    //     return <TrendSpot />;
    //   case 'ad-crafter':
    //     return <AdCrafter />;
    //   case 'home':
    //   default:
    //     return <DashboardHome />;
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
    <div className="fixed inset-0 bg-black text-gray-100 flex overflow-hidden">
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
      
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button 
          className="p-2 rounded-md bg-gray-800 text-gray-300"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>
        
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          SELLOVATE
        </h1>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <User size={18} />
        </div>
      </div>
      
      {/* Sidebar - Mobile (Slide over) */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                    SELLOVATE
                  </h1>
                  <button 
                    className="p-2 rounded-md bg-gray-800 text-gray-300"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">User Name</p>
                      <p className="text-sm text-gray-400">user@example.com</p>
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 py-4 overflow-y-auto">
                  <ul className="space-y-1 px-3">
                    {features.map((feature) => (
                      <li key={feature.id}>
                        <button
                          onClick={() => handleFeatureSelect(feature.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                            activeFeature === feature.id 
                              ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="flex-shrink-0">{feature.icon}</span>
                            <span className="ml-3">{feature.name}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                <div className="p-4 border-t border-gray-800">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSidebarOpen(false);
                        // Handle settings
                      }}
                      className="flex-1 flex items-center justify-center p-2 bg-gray-800 rounded-md text-gray-300"
                    >
                      <Settings size={18} className="mr-2" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center p-2 bg-gray-800 rounded-md text-gray-300"
                    >
                      <LogOut size={18} className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Sidebar - Desktop (Persistent) */}
      {!isMobile && (
        <motion.div 
          className="relative z-30 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 w-64"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                SELLOVATE
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto">
              <ul className="space-y-1 px-4">
                {features.map((feature) => (
                  <li key={feature.id}>
                    <button
                      onClick={() => handleFeatureSelect(feature.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeFeature === feature.id 
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className="flex-shrink-0">{feature.icon}</span>
                      <span className="ml-3">{feature.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* User section */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">User Name</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleFeatureSelect('settings')}
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
      )}
      
      {/* Main content */}
      <motion.div 
        className="flex-1 relative z-10 overflow-y-auto pt-0 lg:pt-0"
        style={{ paddingTop: isMobile ? '60px' : '0' }} // Add padding for mobile header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 lg:p-8 min-h-full">
          {renderFeature()}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;