import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Target, RefreshCw, Search } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_USER_PRODUCTS = gql`
  query GetUserProducts {
    getUserProducts uery Products {
    products {
      id
      name
      description
      category
      price
      inventoryCount
      currency
    }
  }
`;

const SUGGEST_PRICING = gql`
  mutation SuggestPricing($input: DynamicPricingInput!) {
    suggestPricing(input: $input) {
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

const PricePilot = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetMargin, setTargetMargin] = useState(30);
  const [season, setSeason] = useState('CURRENT');
  const [marketDemand, setMarketDemand] = useState('NORMAL');
  const [pricingResult, setPricingResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { loading, error, data } = useQuery(GET_USER_PRODUCTS);
  
  const [suggestPricing] = useMutation(SUGGEST_PRICING, {
    onCompleted: (data) => {
      setPricingResult(data.suggestPricing);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error("Error getting price suggestion:", error);
      setIsAnalyzing(false);
    }
  });

  const handleAnalyzePrice = () => {
    if (!selectedProduct) return;
    
    setIsAnalyzing(true);
    suggestPricing({
      variables: {
        input: {
          productId: selectedProduct.id,
          targetMargin,
          season,
          marketDemand,
          competitorPrices: null
        }
      }
    });
  };

  const seasonOptions = [
    { value: 'CURRENT', label: 'Current Season' },
    { value: 'SPRING', label: 'Spring' },
    { value: 'SUMMER', label: 'Summer' },
    { value: 'FALL', label: 'Fall' },
    { value: 'WINTER', label: 'Winter' }
  ];

  const demandOptions = [
    { value: 'LOW', label: 'Low Demand' },
    { value: 'NORMAL', label: 'Normal Demand' },
    { value: 'HIGH', label: 'High Demand' }
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Price Pilot
        </h1>
        <p className="text-gray-400 mt-2">
          Never overprice or undersell again. Our AI analyzes market trends to suggest your optimal price point.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2 text-purple-500" size={20} />
            Pricing Parameters
          </h2>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Product</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <select 
                className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 w-full appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedProduct?.id || ""}
                onChange={(e) => {
                  const productId = e.target.value;
                  const product = data?.getUserProducts.find(p => p.id === productId);
                  setSelectedProduct(product || null);
                }}
              >
                <option value="">Choose a product</option>
                {!loading && data?.getUserProducts?.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
            {loading && <p className="mt-2 text-sm text-gray-500">Loading products...</p>}
          </div>

          {/* Target Margin */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              <Target size={16} className="mr-2 text-blue-500" />
              Target Profit Margin: {targetMargin}%
            </label>
            <input
              type="range"
              min="5"
              max="70"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span>70%</span>
            </div>
          </div>

          {/* Season Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              <Calendar size={16} className="mr-2 text-pink-500" />
              Season
            </label>
            <div className="grid grid-cols-3 gap-2">
              {seasonOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSeason(option.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    season === option.value
                      ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Market Demand */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              <TrendingUp size={16} className="mr-2 text-green-500" />
              Market Demand
            </label>
            <div className="grid grid-cols-3 gap-2">
              {demandOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setMarketDemand(option.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    marketDemand === option.value
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyzePrice}
            disabled={!selectedProduct || isAnalyzing}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
              !selectedProduct || isAnalyzing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <DollarSign size={18} className="mr-2" />
                Analyze Pricing
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden"
        >
          {!pricingResult && !isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-800/80 flex items-center justify-center mb-4">
                <DollarSign size={36} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Ready to optimize your pricing</h3>
              <p className="text-gray-400 max-w-md">
                Select a product and set your parameters to get AI-driven pricing recommendations based on market analysis.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center p-10">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                <DollarSign size={30} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-3">Analyzing market data</h3>
              <p className="text-gray-400 text-center max-w-md">
                Our AI is examining market trends, competitor prices, and demand patterns to find your optimal price point.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-800">
                <div>
                  <h2 className="text-xl font-semibold text-white">Pricing Analysis</h2>
                  <p className="text-sm text-gray-400">Generated on {new Date(pricingResult.generatedAt).toLocaleString()}</p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center bg-gray-800/60 rounded-lg px-4 py-2 border border-gray-700">
                  <span className="text-gray-400 text-sm mr-2">Recommended Price:</span>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                    ${pricingResult.priceRange?.split('-')[0]} - ${pricingResult.priceRange?.split('-')[1]}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Target size={18} className="text-purple-500 mr-2" />
                    <h3 className="text-gray-300 font-medium">Target Margin</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{pricingResult.targetMargin}%</p>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <TrendingUp size={18} className="text-blue-500 mr-2" />
                    <h3 className="text-gray-300 font-medium">Market Demand</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{pricingResult.marketDemand}</p>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Calendar size={18} className="text-pink-500 mr-2" />
                    <h3 className="text-gray-300 font-medium">Season</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{pricingResult.season}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Analysis Summary</h3>
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-300 whitespace-pre-line">{pricingResult.content}</p>
                </div>
              </div>
              
              {pricingResult.competitors && pricingResult.competitors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Competitor Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800/40 rounded-lg border border-gray-700/50">
                      <thead>
                        <tr className="bg-gray-800/80">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Competitor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Features</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {pricingResult.competitors.map((competitor, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{competitor.name}</div>
                              {competitor.url && (
                                <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                                  View listing
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-white">{competitor.currency}{competitor.price}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-300">
                                {Array.isArray(competitor.features) ? (
                                  <ul className="list-disc pl-4">
                                    {competitor.features.map((feature, idx) => (
                                      <li key={idx}>{feature}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  competitor.features
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PricePilot;