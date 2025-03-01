import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Edit, Check, AlertCircle } from 'lucide-react';

const ListingWizard = () => {
  const [step, setStep] = useState(1);
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!productUrl) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setProductData({
        title: 'Example Product Title',
        description: 'This is an example product description that would be fetched from the provided URL.',
        price: '$99.99',
        images: ['/placeholder-image.jpg'],
        features: [
          'Feature 1: High quality materials',
          'Feature 2: Durable construction',
          'Feature 3: Easy to use'
        ]
      });
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };
  
  const handleOptimize = () => {
    setIsLoading(true);
    
    // Simulate optimization
    setTimeout(() => {
      setProductData({
        ...productData,
        title: 'Premium Example Product - Professional Grade',
        description: 'Experience unmatched quality with our premium example product. Crafted with high-quality materials and designed for durability, this product will exceed your expectations.',
        features: [
          'Premium Quality: Made with top-grade materials for lasting performance',
          'Professional Design: Engineered for maximum efficiency and ease of use',
          'Versatile Application: Perfect for both home and professional settings',
          'Durable Construction: Built to withstand regular use',
          'Satisfaction Guaranteed: Backed by our quality promise'
        ]
      });
      setIsLoading(false);
      setStep(3);
    }, 2000);
  };
  
  return (
    <div className="h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Listing Wizard
        </h1>
        <p className="mt-2 text-gray-400">
          Create optimized product listings with AI assistance
        </p>
      </div>
      
      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <Search size={16} />
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <Edit size={16} />
        </div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}>
          <Check size={16} />
        </div>
      </div>
      
      {/* Step 1: Enter URL */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Enter Product URL</h2>
          <p className="text-gray-400 mb-6">
            Paste a product URL from Amazon, eBay, or other marketplaces to start creating your optimized listing.
          </p>
          
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Product URL</label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://www.amazon.com/product-example"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !productUrl}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Fetching product...
                </div>
              ) : (
                'Fetch Product Data'
              )}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-purple-400 mr-2 mt-0.5" />
              <p className="text-sm text-gray-400">
                You can also upload product images directly or enter product details manually if you don't have a URL.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Edit Product Data */}
      {step === 2 && productData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Edit Product Details</h2>
          <p className="text-gray-400 mb-6">
            Review and edit the extracted product information before optimization.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-1">Product Title</label>
              <input
                type="text"
                value={productData.title}
                onChange={(e) => setProductData({...productData, title: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Description</label>
              <textarea
                value={productData.description}
                onChange={(e) => setProductData({...productData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Features</label>
              {productData.features.map((feature, index) => (
                <input
                  key={index}
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...productData.features];
                    newFeatures[index] = e.target.value;
                    setProductData({...productData, features: newFeatures});
                  }}
                  className="w-full px-4 py-2 mb-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Optimizing...
                  </div>
                ) : (
                  'Optimize with AI'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Step 3: Optimized Result */}
      {step === 3 && productData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 mr-3">
              <Check size={16} />
            </div>
            <h2 className="text-xl font-semibold">Optimization Complete!</h2>
          </div>
          
          <p className="text-gray-400 mb-6">
            Your product listing has been optimized for maximum visibility and conversion.
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Optimized Title</h3>
              <p>{productData.title}</p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Optimized Description</h3>
              <p>{productData.description}</p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Optimized Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                {productData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Edit Again
              </button>
              
              <button
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Export Listing
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ListingWizard;