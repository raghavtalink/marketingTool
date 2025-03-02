import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  TrendingUp, 
  Clock, 
  PieChart, 
  Calendar, 
  Users, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
  Search,
  Zap,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { Link } from 'react-router-dom';
import '../../custom.css';


// GraphQL mutation
const ANALYZE_TRENDS = gql`
  mutation AnalyzeTrends($input: MarketTrendAnalysisInput!) {
    analyzeTrends(input: $input) {
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

// Add Products query
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

const TrendSpot = () => {
  const [timeframe, setTimeframe] = useState('CURRENT');
  const [trendType, setTrendType] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [userProducts, setUserProducts] = useState([]);
  const [trendError, setTrendError] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  // Add useQuery hook for products
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  
  // GraphQL mutation hook
  const [analyzeTrends, { loading, error }] = useMutation(ANALYZE_TRENDS);
  
  // Fetch initial trend data and update products when data is available
  useEffect(() => {
    fetchTrendData();
    
    if (productsData && productsData.products) {
      setUserProducts(productsData.products);
    }
  }, [productsData]);
  
  // Modify fetchTrendData to use selected productId if available and handle errors better
  const fetchTrendData = async (productId = null) => {
    setTrendError(false);
    try {
      const { data } = await analyzeTrends({
        variables: {
          input: {
            productId: productId,
            timeframe: timeframe,
            trendType: trendType
          }
        }
      });
      
      if (data && data.analyzeTrends) {
        setTrendData(data.analyzeTrends);
      }
    } catch (err) {
      console.error("Error fetching trend data:", err);
      setTrendError(true);
    }
  };
  
  // Add function to analyze specific product
  const analyzeProduct = (productId) => {
    fetchTrendData(productId);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchTrendData();
  };
  
  // Placeholder chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Market Demand',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  const competitorsData = {
    labels: ['Competitor A', 'Competitor B', 'Competitor C', 'Competitor D'],
    datasets: [
      {
        label: 'Price Points',
        data: [65, 59, 80, 81],
        backgroundColor: [
          'rgba(138, 43, 226, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Mock trend data if not available from API
  const mockTrendProducts = [
    { 
      name: 'Wireless Earbuds', 
      growth: '+32%', 
      positive: true, 
      category: 'Electronics',
      price: '$45-$89'
    },
    { 
      name: 'Eco-Friendly Water Bottles', 
      growth: '+28%', 
      positive: true, 
      category: 'Lifestyle',
      price: '$20-$35'
    },
    { 
      name: 'Smart Home Sensors', 
      growth: '+25%', 
      positive: true, 
      category: 'Home & Garden',
      price: '$25-$60'
    },
    { 
      name: 'Wired Headphones', 
      growth: '-15%', 
      positive: false, 
      category: 'Electronics',
      price: '$15-$40'
    },
  ];
  
  // Render loading state for the initial load only
  if (loading && !trendData && !trendError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <RefreshCw size={40} className="text-purple-500" />
        </motion.div>
        <p className="text-lg text-gray-300">Discovering market trends...</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            TrendSpot
          </h2>
          <p className="text-gray-400 mt-1">Discover what's trending in the market right now</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => fetchTrendData()}
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-full transition-colors flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-to-r from-purple-700 to-blue-600 rounded-full"
          >
            <Zap size={20} />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Display error toast if trend data fetch failed */}
      {trendError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center">
            <p className="text-red-400">Failed to load trend data.</p>
            <button 
              onClick={fetchTrendData}
              className="ml-auto px-3 py-1 bg-gray-800 rounded-md text-gray-200 hover:bg-gray-700 text-sm"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Time selection */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <h3 className="text-gray-300 mb-3 flex items-center">
            <Clock size={18} className="mr-2 text-purple-400" />
            Select Timeframe
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {['CURRENT', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimeframeChange(time)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  timeframe === time 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {time === 'CURRENT' ? 'Now' : 
                 time === 'THREE_MONTHS' ? '3 Months' : 
                 time === 'SIX_MONTHS' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Tab navigation */}
      <motion.div variants={itemVariants} className="border-b border-gray-700">
        <div className="flex overflow-x-auto hide-scrollbar space-x-6">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
            { id: 'competitors', label: 'Competitors', icon: <Users size={18} /> },
            { id: 'market', label: 'Market Demand', icon: <TrendingUp size={18} /> },
            { id: 'insights', label: 'Insights', icon: <PieChart size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`pb-3 px-1 flex items-center whitespace-nowrap transition-colors ${
                selectedTab === tab.id 
                  ? 'text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* User's Products */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-medium text-lg text-gray-200 flex items-center">
                    <ShoppingBag size={18} className="mr-2 text-purple-400" />
                    Your Products
                  </h3>
                </div>
                
                {productsLoading ? (
                  <div className="p-4 text-center text-gray-400">Loading your products...</div>
                ) : userProducts.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {userProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-700/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-200">{product.name}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-400">{product.category}</span>
                              <span className="text-sm text-gray-400">{product.currency} {product.price}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => analyzeProduct(product.id)}
                            className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-sm rounded-full"
                          >
                            Analyze
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 mb-3">No products found</p>
                    <Link to="/dashboard/products" className="px-4 py-2 bg-purple-600 text-white rounded-full">
                      Add Products
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Trending products */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium text-lg text-gray-200 flex items-center">
                    <TrendingUp size={18} className="mr-2 text-purple-400" />
                    Trending Products
                  </h3>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search trends..."
                      className="py-1.5 pl-8 pr-4 bg-gray-700/50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                  </div>
                </div>
                
                <div className="divide-y divide-gray-700">
                  {mockTrendProducts.map((product, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 hover:bg-gray-700/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-200">{product.name}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-400">{product.category}</span>
                            <span className="text-sm text-gray-400">{product.price}</span>
                          </div>
                        </div>
                        <div className={`flex items-center ${product.positive ? 'text-green-400' : 'text-red-400'}`}>
                          {product.positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                          <span className="ml-1 font-medium">{product.growth}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Market overview chart */}
              <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4 flex items-center">
                  <Activity size={18} className="mr-2 text-purple-400" />
                  Market Trends Overview
                </h3>
                <div className="h-64">
                  <Line 
                    data={lineChartData} 
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'competitors' && (
            <div className="space-y-6">
              <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-purple-400" />
                  Competitor Price Analysis
                </h3>
                <div className="h-80">
                  <Bar 
                    data={competitorsData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Competitor features comparison */}
              <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4">
                  Top Competitor Strategies
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'Competitor A', strategy: 'Bundle offers with 25% discount', impact: 'High' },
                    { name: 'Competitor B', strategy: 'Flash sales every weekend', impact: 'Medium' },
                    { name: 'Competitor C', strategy: 'Free shipping above $50', impact: 'High' },
                  ].map((competitor, index) => (
                    <div key={index} className="p-3 bg-gray-700/20 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-200">{competitor.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          competitor.impact === 'High' ? 'bg-green-500/20 text-green-400' : 
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {competitor.impact} Impact
                        </span>
                      </div>
                      <p className="text-gray-400 mt-1.5 text-sm">{competitor.strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'market' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-lg text-gray-200 mb-4 flex items-center">
                    <Calendar size={18} className="mr-2 text-purple-400" />
                    Seasonal Trends
                  </h3>
                  <div className="h-64">
                    <Doughnut 
                      data={{
                        labels: ['Spring', 'Summer', 'Fall', 'Winter'],
                        datasets: [{
                          data: [25, 35, 25, 15],
                          backgroundColor: [
                            'rgba(132, 204, 22, 0.7)',
                            'rgba(234, 179, 8, 0.7)',
                            'rgba(217, 119, 6, 0.7)',
                            'rgba(96, 165, 250, 0.7)',
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: 'rgba(255, 255, 255, 0.8)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-lg text-gray-200 mb-4 flex items-center">
                    <DollarSign size={18} className="mr-2 text-purple-400" />
                    Price Range Analysis
                  </h3>
                  <div className="h-64">
                    <Bar 
                      data={{
                        labels: ['Budget', 'Mid-range', 'Premium', 'Luxury'],
                        datasets: [{
                          label: 'Market Share',
                          data: [40, 30, 20, 10],
                          backgroundColor: 'rgba(147, 51, 234, 0.6)',
                          borderColor: 'rgba(147, 51, 234, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                          legend: {
                            labels: {
                              color: 'rgba(255, 255, 255, 0.8)'
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.6)'
                            }
                          },
                          y: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.6)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-purple-400" />
                  Target Audience Insights
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { group: 'Gen Z', percentage: '35%', growth: '+12%' },
                    { group: 'Millennials', percentage: '45%', growth: '+8%' },
                    { group: 'Gen X', percentage: '15%', growth: '-2%' },
                  ].map((audience, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-900/40"
                    >
                      <h4 className="text-lg font-medium text-gray-200">{audience.group}</h4>
                      <div className="mt-3 flex justify-between items-end">
                        <span className="text-3xl font-bold text-white">{audience.percentage}</span>
                        <span className={audience.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                          {audience.growth}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'insights' && (
            <div className="space-y-6">
              <div className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4">Key Insights</h3>
                
                <div className="space-y-4">
                  {[
                    "The market for eco-friendly products is growing at 28% annually, with highest demand in coastal regions.",
                    "Competitors are shifting towards subscription-based models, offering 15-20% discounts for recurring purchases.",
                    "Price sensitivity is decreasing in the premium segment, with customers prioritizing quality and sustainability.",
                    "Social media influencer marketing shows 3x higher conversion rates compared to traditional advertising."
                  ].map((insight, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex"
                    >
                      <div className="flex-shrink-0 h-8 w-8 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                        <Zap size={16} className="text-purple-400" />
                      </div>
                      <p className="ml-3 text-gray-300">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
                <h3 className="font-medium text-lg text-gray-200 mb-4">Recommendations</h3>
                
                <div className="space-y-4">
                  {[
                    { title: "Adjust Pricing Strategy", description: "Consider a 10-15% premium pricing with emphasis on quality differentiators." },
                    { title: "Expand Product Line", description: "Add complementary products to capture the growing eco-friendly market segment." },
                    { title: "Revise Marketing Approach", description: "Increase social media presence with focus on sustainability and ethical sourcing." },
                  ].map((rec, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg">
                      <h4 className="text-white font-medium">{rec.title}</h4>
                      <p className="mt-1 text-gray-300 text-sm">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default TrendSpot;