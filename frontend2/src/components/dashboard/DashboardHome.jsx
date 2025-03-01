import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Box, 
  Lightbulb, 
  DollarSign, 
  Camera, 
  TrendingUp, 
  Megaphone 
} from 'lucide-react';

const DashboardHome = () => {
  // Feature cards data
  const featureCards = [
    { 
      id: 'listing-wizard', 
      name: 'Listing Wizard', 
      icon: <Package size={24} />, 
      description: 'Create optimized product listings with AI assistance',
      color: 'from-blue-500 to-purple-500'
    },
    { 
      id: 'bundle-builder', 
      name: 'Bundle Builder', 
      icon: <Box size={24} />, 
      description: 'Create and optimize product bundles for maximum profit',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'product-genius', 
      name: 'Product Genius', 
      icon: <Lightbulb size={24} />, 
      description: 'Get AI-powered insights for your product strategy',
      color: 'from-pink-500 to-red-500'
    },
    { 
      id: 'price-pilot', 
      name: 'Price Pilot', 
      icon: <DollarSign size={24} />, 
      description: 'Optimize pricing with competitive analysis',
      color: 'from-red-500 to-orange-500'
    },
    { 
      id: 'instant-studio', 
      name: 'Instant Studio', 
      icon: <Camera size={24} />, 
      description: 'Create professional product images and videos',
      color: 'from-orange-500 to-yellow-500'
    },
    { 
      id: 'trendspot', 
      name: 'TrendSpot', 
      icon: <TrendingUp size={24} />, 
      description: 'Discover trending products and market opportunities',
      color: 'from-yellow-500 to-green-500'
    },
    { 
      id: 'ad-crafter', 
      name: 'Ad Crafter', 
      icon: <Megaphone size={24} />, 
      description: 'Create high-converting ad campaigns for your products',
      color: 'from-green-500 to-blue-500'
    },
  ];

  return (
    <div className="h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Welcome to Sellovate
        </h1>
        <p className="mt-2 text-gray-400">
          Your all-in-one platform for e-commerce success
        </p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium">Active Products</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium">Total Sales (30d)</h3>
          <p className="text-3xl font-bold mt-2">$12,450</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium">Conversion Rate</h3>
          <p className="text-3xl font-bold mt-2">4.2%</p>
        </div>
      </div>
      
      {/* Feature cards */}
      <h2 className="text-xl font-semibold mb-4">Tools & Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
          >
            <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10`}>
                  {feature.icon}
                </div>
                <h3 className="ml-3 font-semibold">{feature.name}</h3>
              </div>
              <p className="text-gray-400 text-sm">{feature.description}</p>
              <button className="mt-4 text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center">
                Open tool
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;