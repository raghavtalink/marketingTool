import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Package, PlusCircle, Target, DollarSign, Calendar, Users, ShoppingBag, RefreshCw, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

// GraphQL queries and mutations
const GET_PRODUCTS = gql`
  query Products {
    products {
      id
      name
      description
      category
      price
      inventoryCount
      competitorUrls
      currency
      userId
      createdAt
      updatedAt
    }
  }
`;

const RECOMMEND_BUNDLES = gql`
  mutation RecommendBundles($input: BundleRecommendationInput!) {
    recommendBundles(input: $input) {
      id
      productId
      analysisType
      content
      generatedAt
      competitors {
        name
        price
        currency
        url
        features
      }
      targetMargin
      marketDemand
      season
      targetAudience
      priceRange
    }
  }
`;

const BundleBuilder = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [priceRange, setPriceRange] = useState('MEDIUM');
  const [season, setSeason] = useState('CURRENT');
  const [targetAudience, setTargetAudience] = useState('');
  const [bundleResults, setBundleResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const { loading, error, data } = useQuery(GET_PRODUCTS);
  
  const [recommendBundles] = useMutation(RECOMMEND_BUNDLES, {
    onCompleted: (data) => {
      setBundleResults(data.recommendBundles);
      setIsAnalyzing(false);
      setActiveTab('results');
    },
    onError: (error) => {
      console.error('Error generating bundle recommendations:', error);
      setIsAnalyzing(false);
    }
  });

  const handleProductSelect = (product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      if (selectedProducts.length < 5) {
        setSelectedProducts([...selectedProducts, product]);
      }
    }
  };

  const generateBundleRecommendations = () => {
    if (selectedProducts.length < 2) {
      alert('Please select at least 2 products to create a bundle');
      return;
    }
    
    if (!targetAudience) {
      alert('Please specify a target audience');
      return;
    }
    
    setIsAnalyzing(true);
    
    recommendBundles({
      variables: {
        input: {
          productIds: selectedProducts.map(p => p.id),
          priceRange,
          season,
          targetAudience
        }
      }
    });
  };

  // Generate some suggested product combinations
  const getSuggestedCombinations = () => {
    if (!data || !data.products || data.products.length < 2) return [];
    
    const products = data.products;
    const combinations = [];
    
    // Generate some random combinations (up to 3)
    for (let i = 0; i < Math.min(3, Math.floor(products.length / 2)); i++) {
      const combo = [];
      const usedIndices = new Set();
      
      // Add 2-3 random products to each combination
      for (let j = 0; j < 2 + Math.floor(Math.random() * 2); j++) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * products.length);
        } while (usedIndices.has(randomIndex));
        
        usedIndices.add(randomIndex);
        combo.push(products[randomIndex]);
      }
      
      combinations.push(combo);
    }
    
    // Add category-based combinations (products from same category)
    const categoriesMap = {};
    products.forEach(product => {
      if (!categoriesMap[product.category]) {
        categoriesMap[product.category] = [];
      }
      categoriesMap[product.category].push(product);
    });
    
    Object.values(categoriesMap).forEach(categoryProducts => {
      if (categoryProducts.length >= 2) {
        combinations.push(categoryProducts.slice(0, Math.min(3, categoryProducts.length)));
      }
    });
    
    return combinations.slice(0, 4); // Return up to 4 combinations
  };

  const resetBuilder = () => {
    setSelectedProducts([]);
    setPriceRange('MEDIUM');
    setSeason('CURRENT');
    setTargetAudience('');
    setBundleResults(null);
    setActiveTab('builder');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-900/20 rounded-lg">
      <h3 className="text-xl font-medium text-red-400">Error loading products</h3>
      <p className="mt-2 text-gray-300">We couldn't load your products. Please try again later.</p>
    </div>
  );

  const suggestedCombinations = getSuggestedCombinations();

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Bundle Builder
          </h1>
          <p className="text-gray-400 mt-2">
            Create powerful product bundles that boost sales and customer satisfaction
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'builder' 
                ? 'bg-purple-600/30 text-purple-300 border border-purple-600/50' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Package size={18} className="mr-2" />
            Builder
          </button>
          
          {bundleResults && (
            <button 
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'results' 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-600/50' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <ShoppingBag size={18} className="mr-2" />
              Results
            </button>
          )}
        </div>
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-8">
          {/* Product Selection Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag size={20} className="mr-2 text-purple-400" />
              Select Products for Your Bundle (2-5)
            </h2>
            
            {selectedProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Selected Products:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map(product => (
                    <motion.div 
                      key={product.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-purple-900/30 border border-purple-600/30 rounded-lg px-3 py-2 flex items-center"
                    >
                      <span className="text-purple-200">{product.name}</span>
                      <button 
                        onClick={() => handleProductSelect(product)}
                        className="ml-2 text-purple-400 hover:text-purple-200"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.products.map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProductSelect(product)}
                  className={`cursor-pointer p-4 rounded-xl transition-colors ${
                    selectedProducts.some(p => p.id === product.id)
                      ? 'bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-purple-500/50'
                      : 'bg-gray-900/60 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{product.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedProducts.some(p => p.id === product.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {selectedProducts.some(p => p.id === product.id) ? (
                        <X size={14} />
                      ) : (
                        <PlusCircle size={14} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-gray-400">{product.category}</span>
                    <span className="font-medium text-green-400">
                      {product.currency === 'USD' ? '$' : product.currency} {product.price}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bundle Parameters */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target size={20} className="mr-2 text-blue-400" />
              Bundle Parameters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CURRENT">Current Season</option>
                  <option value="SPRING">Spring</option>
                  <option value="SUMMER">Summer</option>
                  <option value="FALL">Fall</option>
                  <option value="WINTER">Winter</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <Users size={16} className="mr-1" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="E.g., Women, Tech enthusiasts, etc."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={generateBundleRecommendations}
                disabled={selectedProducts.length < 2 || !targetAudience || isAnalyzing}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  selectedProducts.length < 2 || !targetAudience || isAnalyzing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                    Analyzing Bundle...
                  </>
                ) : (
                  <>
                    Generate Bundle Recommendations
                    <ChevronRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Suggested Combinations */}
          {suggestedCombinations.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package size={20} className="mr-2 text-pink-400" />
                Suggested Combinations
              </h2>
              
              <p className="text-gray-400 mb-4">Here are some potential product combinations based on your inventory:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedCombinations.map((combo, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-300 mb-2">
                      {combo[0].category} Bundle {index + 1}
                    </h3>
                    <div className="space-y-2">
                      {combo.map(product => (
                        <div key={product.id} className="flex justify-between">
                          <span className="text-sm text-gray-400">{product.name}</span>
                          <span className="text-sm text-green-400">
                            ${product.price}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
                      <span className="text-sm text-gray-400">Total</span>
                      <span className="font-medium text-white">
                        ${combo.reduce((sum, product) => sum + parseFloat(product.price), 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProducts(combo);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-3 w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Use This Combination
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && bundleResults && (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-6 rounded-2xl border border-purple-700/30"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400">
                  Bundle Analysis Results
                </h2>
                <p className="text-gray-400">
                  For {selectedProducts.length} products targeting {bundleResults.targetAudience}
                </p>
              </div>
              
              <button
                onClick={resetBuilder}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Start New Bundle
              </button>
            </div>
            
            {/* Bundle Content */}
            <div className="mt-6 p-5 bg-gray-900/60 rounded-xl border border-gray-800">
              <h3 className="text-lg font-medium mb-3 text-purple-300">Bundle Insights</h3>
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: bundleResults.content }} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Market Demand</h3>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  {bundleResults.marketDemand || "Medium-High"}
                </div>
              </div>
              
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Target Margin</h3>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {bundleResults.targetMargin || "25-30%"}
                </div>
              </div>
              
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Price Range</h3>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                  {bundleResults.priceRange}
                </div>
              </div>
            </div>
            
            {/* Selected Products */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-blue-300">Products in This Bundle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-gray-900/60 p-4 rounded-xl border border-gray-800"
                  >
                    <h4 className="font-medium text-white">{product.name}</h4>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-400">{product.category}</span>
                      <span className="font-medium text-green-400">${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Competitors */}
            {bundleResults.competitors && bundleResults.competitors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 text-pink-300">Competitive Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-900/60 rounded-xl border border-gray-800">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Competitor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Key Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {bundleResults.competitors.map((competitor, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-white">{competitor.name}</td>
                          <td className="px-4 py-3 text-sm text-white">
                            {competitor.currency} {competitor.price}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {competitor.features?.join(', ') || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BundleBuilder;