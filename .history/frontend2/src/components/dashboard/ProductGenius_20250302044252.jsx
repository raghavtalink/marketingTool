import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, Globe, Wifi, WifiOff, ChevronDown, Search, Package, 
  TrendingUp, Users, Zap, Star, FileText, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL queries
const GET_USER_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      category
      price
      currency
      inventoryCount
    }
  }
`;

const CHAT_MUTATION = gql`
  mutation Chat($input: ChatInput!) {
    chat(input: $input) {
      content
      format
      webDataUsed
    }
  }
`;

// Quick insight options
const QUICK_INSIGHTS = [
  { 
    id: 'market', 
    name: 'Market Analysis', 
    icon: <TrendingUp size={20} className="text-green-300" />,
    prompt: "Compare this product with the best ones in the market. What are our competitive advantages and disadvantages?",
    gradient: "from-green-600/20 to-green-400/20",
    borderColor: "border-green-500"
  },
  { 
    id: 'customers', 
    name: 'Customer Insights', 
    icon: <Users size={20} className="text-blue-300" />,
    prompt: "What are the most common questions and concerns customers might have about this product?",
    gradient: "from-blue-600/20 to-blue-400/20",
    borderColor: "border-blue-500"
  },
  { 
    id: 'improvement', 
    name: 'Improvement Ideas', 
    icon: <Zap size={20} className="text-yellow-300" />,
    prompt: "How can we improve this product? Suggest 5 specific enhancements based on current market trends.",
    gradient: "from-yellow-600/20 to-yellow-400/20",
    borderColor: "border-yellow-500"
  },
  { 
    id: 'selling', 
    name: 'Key Selling Points', 
    icon: <Star size={20} className="text-red-300" />,
    prompt: "What are the top 5 selling points I should emphasize when marketing this product?",
    gradient: "from-red-600/20 to-red-400/20",
    borderColor: "border-red-500"
  },
  { 
    id: 'description', 
    name: 'Product Description', 
    icon: <FileText size={20} className="text-purple-300" />,
    prompt: "Generate a compelling product description that highlights all the key features and benefits.",
    gradient: "from-purple-600/20 to-purple-400/20",
    borderColor: "border-purple-500"
  }
];

// Custom Loader Component
const InsightLoader = () => (
  <div className="flex justify-center py-8">
    <motion.div
      className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 border-b-pink-400"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const ProductGenius = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [insights, setInsights] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchWeb, setSearchWeb] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [insightType, setInsightType] = useState('all');
  const insightsEndRef = useRef(null);
  
  // Fetch user products
  const { loading: productsLoading, error: productsError, data: productsData } = useQuery(GET_USER_PRODUCTS);
  
  // Chat mutation
  const [sendChat, { loading: chatLoading }] = useMutation(CHAT_MUTATION);
  
  // Filter products based on search query
  const filteredProducts = productsData?.products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Scroll to bottom of insights
  useEffect(() => {
    insightsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [insights]);
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
    // Add welcome insight
    setInsights([
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Product Genius Ready',
        content: `I'm ready to help with your "${product.name}" product! Ask me anything about it, request improvement tips, or explore potential customer questions.`,
        format: 'text',
        timestamp: new Date().toISOString()
      }
    ]);
  };
  
  // Handle quick insight selection
  const handleQuickInsight = async (insight) => {
    if (chatLoading || !selectedProduct) return;
    
    // Add user request to insights
    const userInsight = {
      id: `user-${Date.now()}`,
      type: insight.id,
      title: insight.name,
      content: insight.prompt,
      format: 'text',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setInsights(prev => [...prev, userInsight]);
    
    try {
      // Add loading indicator
      const loadingId = `loading-${Date.now()}`;
      setInsights(prev => [...prev, { 
        id: loadingId, 
        type: insight.id,
        title: 'Generating Insight...',
        content: '...',
        format: 'loading',
        timestamp: new Date().toISOString()
      }]);
      
      // Prepare chat input
      const chatInput = {
        searchWeb,
        productId: selectedProduct.id,
        messages: [
          {
            message: insight.prompt,
            sender: 'null'
          }
        ]
      };
      
      // Send to API
      const response = await sendChat({ variables: { input: chatInput } });
      
      // Remove loading indicator and add AI response
      setInsights(prev => {
        const filtered = prev.filter(ins => ins.id !== loadingId);
        return [...filtered, {
          id: `ai-${Date.now()}`,
          type: insight.id,
          title: insight.name,
          content: response.data.chat.content,
          format: response.data.chat.format,
          webDataUsed: response.data.chat.webDataUsed,
          timestamp: new Date().toISOString()
        }];
      });
      
    } catch (error) {
      console.error('Error sending insight request:', error);
      // Remove loading indicator and add error message
      setInsights(prev => {
        const filtered = prev.filter(ins => ins.format !== 'loading');
        return [...filtered, {
          id: `error-${Date.now()}`,
          type: 'error',
          title: 'Error',
          content: 'Sorry, I encountered an error. Please try again.',
          format: 'text',
          timestamp: new Date().toISOString()
        }];
      });
    }
  };
  
  // Handle sending a custom message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProduct || chatLoading) return;
    
    // Add user message to insights
    const userInsight = {
      id: `user-${Date.now()}`,
      type: 'custom',
      title: 'Custom Question',
      content: inputMessage,
      format: 'text',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setInsights(prev => [...prev, userInsight]);
    setInputMessage('');
    
    try {
      // Add loading indicator
      const loadingId = `loading-${Date.now()}`;
      setInsights(prev => [...prev, { 
        id: loadingId, 
        type: 'custom',
        title: 'Generating Insight...',
        content: '...',
        format: 'loading',
        timestamp: new Date().toISOString()
      }]);
      
      // Prepare chat input
      const chatInput = {
        searchWeb,
        productId: selectedProduct.id,
        messages: [
          {
            message: inputMessage,
            sender: 'null'
          }
        ]
      };
      
      // Send to API
      const response = await sendChat({ variables: { input: chatInput } });
      
      // Remove loading indicator and add AI response
      setInsights(prev => {
        const filtered = prev.filter(ins => ins.id !== loadingId);
        return [...filtered, {
          id: `ai-${Date.now()}`,
          type: 'custom',
          title: 'AI Insight',
          content: response.data.chat.content,
          format: response.data.chat.format,
          webDataUsed: response.data.chat.webDataUsed,
          timestamp: new Date().toISOString()
        }];
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading indicator and add error message
      setInsights(prev => {
        const filtered = prev.filter(ins => ins.format !== 'loading');
        return [...filtered, {
          id: `error-${Date.now()}`,
          type: 'error',
          title: 'Error',
          content: 'Sorry, I encountered an error. Please try again.',
          format: 'text',
          timestamp: new Date().toISOString()
        }];
      });
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Render insight content
  const renderInsightContent = (insight) => {
    if (insight.format === 'loading') {
      return <InsightLoader />;
    }
    
    if (insight.format === 'html') {
      return (
        <div 
          className="prose prose-invert max-w-none overflow-auto"
          dangerouslySetInnerHTML={{ __html: insight.content }}
        />
      );
    }
    
    return <p>{insight.content}</p>;
  };
  
  // Get insight gradient styles based on type
  const getInsightStyles = (type) => {
    const insightOption = QUICK_INSIGHTS.find(i => i.id === type);
    if (!insightOption) {
      // Default or custom insight styles
      if (type === 'welcome') {
        return {
          gradient: "from-gray-700/50 to-gray-600/50",
          border: "border-gray-500"
        };
      }
      return {
        gradient: "from-indigo-600/20 to-indigo-400/20",
        border: "border-indigo-500"
      };
    }
    return {
      gradient: insightOption.gradient,
      border: insightOption.borderColor
    };
  };
  
  // Filter insights based on selected type
  const filteredInsights = insightType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === insightType || insight.type === 'welcome');
  
  // If no product is selected, show product selector
  if (!selectedProduct && !showProductSelector) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700 shadow-xl"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
              animate={{ 
                boxShadow: ['0 0 0 rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0.6)', '0 0 0 rgba(139, 92, 246, 0.3)'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Product Genius
          </h2>
          
          <p className="text-gray-300 text-center mb-6">
            Unlock powerful AI insights about your product! Discover market opportunities, customer perspectives, and improvement ideas at a glance.
          </p>
          
          <button
            onClick={() => setShowProductSelector(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/20"
          >
            Select a Product to Begin
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col relative">
      {/* Dynamic Background with subtle animation */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50" />
      
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-lg border-b border-gray-700 rounded-t-xl shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedProduct?.images?.[0] ? (
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <Sparkles size={20} className="text-white" />
              )}
            </motion.div>
            
            <div>
              <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Product Genius
              </h2>
              
              {selectedProduct && (
                <button 
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {selectedProduct.name}
                  <ChevronDown size={14} className="ml-1" />
                </button>
              )}
            </div>
          </div>
          
          <motion.button 
            onClick={() => setSearchWeb(!searchWeb)}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              searchWeb 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-gray-700 text-gray-400 border border-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {searchWeb ? <Wifi size={14} className="mr-1.5" /> : <WifiOff size={14} className="mr-1.5" />}
            {searchWeb ? 'Web Search: ON' : 'Web Search: OFF'}
          </motion.button>
        </div>
        
        {/* Insight Type Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar px-4 pb-3">
          <button
            onClick={() => setInsightType('all')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap mr-2 transition-all ${
              insightType === 'all'
                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            All Insights
          </button>
          
          {QUICK_INSIGHTS.map(insight => (
            <button
              key={insight.id}
              onClick={() => setInsightType(insight.id)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap mr-2 transition-all flex items-center ${
                insightType === insight.id
                  ? `bg-gradient-to-r ${insight.gradient} text-white border ${insight.borderColor}/50`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {React.cloneElement(insight.icon, { size: 14, className: "mr-1.5" })}
              {insight.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Product Selector Dropdown */}
      <AnimatePresence>
        {showProductSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-24 left-4 z-50 w-80 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto hide-scrollbar">
              {productsLoading ? (
                <div className="px-4 py-3 text-gray-400 text-sm flex items-center">
                  <motion.div 
                    className="w-4 h-4 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Loading products...
                </div>
              ) : productsError ? (
                <div className="px-4 py-3 text-red-400 text-sm">Error loading products</div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-3 text-gray-400 text-sm">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <motion.button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center border-b border-gray-700/50 last:border-0 ${
                      selectedProduct?.id === product.id ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 mr-3 flex items-center justify-center border border-gray-700">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-400 flex items-center mt-0.5">
                        <span className="mr-2">{product.category || 'No category'}</span>
                        {product.price && (
                          <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                            {product.currency || '$'}{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Insight Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4">
        {QUICK_INSIGHTS.map(insight => (
          <motion.button
            key={insight.id}
            onClick={() => handleQuickInsight(insight)}
            disabled={chatLoading}
            className={`p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${insight.gradient} ${insight.borderColor} hover:shadow-lg transition-all flex flex-col items-center justify-center text-center`}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-full bg-gray-800/50 flex items-center justify-center mb-2">
              {insight.icon}
            </div>
            <span className="text-sm font-medium">{insight.name}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Scrollable Insights Area with padding for fixed input */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-center p-6">
            <div>
              <motion.div 
                className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center"
                animate={{ 
                  boxShadow: ['0 0 0 rgba(139, 92, 246, 0.1)', '0 0 15px rgba(139, 92, 246, 0.2)', '0 0 0 rgba(139, 92, 246, 0.1)'] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lightbulb size={32} className="text-gray-400" />
              </motion.div>
              <p className="text-lg font-medium mb-2">No insights yet</p>
              <p className="text-sm">Select a quick insight above or ask a custom question below</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredInsights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className={`rounded-xl border backdrop-blur-sm shadow-lg overflow-hidden bg-gradient-to-br ${styles.gradient} ${styles.border}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        {insight.sender === 'user' ? (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium">You</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-2">
                            <Sparkles size={12} className="text-white" />
                          </div>
                        )}
                        <h3 className="font-medium">{insight.title}</h3>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      {renderInsightContent(insight)}
                    </div>
                    
                    {insight.webDataUsed && (
                      <div className="mt-3 flex items-center text-xs text-blue-400">
                        <Globe size={12} className="mr-1" />
                        Web data was used to generate this insight
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={insightsEndRef} />
      </div>
      
      {/* Absolutely Positioned Input Area at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-lg rounded-b-xl shadow-lg">
        <div className="p-4">
          <div className="flex items-center">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your product..."
              className="flex-1 bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none shadow-inner"
              rows="1"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={chatLoading || !inputMessage.trim()}
              className={`ml-3 p-3 rounded-full shadow-lg ${
                chatLoading || !inputMessage.trim()
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              } transition-all`}
              whileHover={!chatLoading && inputMessage.trim() ? { scale: 1.05 } : {}}
              whileTap={!chatLoading && inputMessage.trim() ? { scale: 0.95 } : {}}
            >
              {chatLoading ? (
                <motion.div 
                  className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProductGenius;