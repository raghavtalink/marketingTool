import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, Globe, Wifi, WifiOff, ChevronDown, Search, Package, 
  TrendingUp, Users, Zap, Star, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL queries
const GET_USER_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      images
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

// Insight categories with template prompts
const INSIGHT_CATEGORIES = [
  {
    id: 'all',
    name: 'All Insights',
    icon: <Sparkles size={20} className="text-purple-300" />,
    gradient: "from-purple-600/20 to-blue-600/20",
    borderColor: "border-purple-500"
  },
  { 
    id: 'market', 
    name: 'Market Analysis', 
    icon: <TrendingUp size={20} className="text-green-300" />,
    gradient: "from-green-600/20 to-green-400/20",
    borderColor: "border-green-500",
    templates: [
      {
        title: "Competitor Comparison",
        prompt: "Compare this product with top 3 competitors in terms of features and benefits"
      },
      {
        title: "Market Gap Analysis",
        prompt: "What market gaps does this product fill that competitors don't address?"
      },
      {
        title: "Market Trends",
        prompt: "Analyze current market trends affecting this product category"
      },
      {
        title: "Pricing Analysis",
        prompt: "How does our pricing compare to similar products in the market?"
      },
      {
        title: "Unique Selling Props",
        prompt: "What are the unique selling propositions compared to alternatives?"
      }
    ]
  },
  { 
    id: 'customers', 
    name: 'Customer Insights', 
    icon: <Users size={20} className="text-blue-300" />,
    gradient: "from-blue-600/20 to-blue-400/20",
    borderColor: "border-blue-500",
    templates: [
      {
        title: "Common Questions",
        prompt: "What are the most common customer questions about this type of product?"
      },
      {
        title: "Objection Handling",
        prompt: "Generate potential customer objections and how to address them"
      },
      {
        title: "Problem Solving",
        prompt: "What customer problems does this product solve most effectively?"
      },
      {
        title: "Customer Personas",
        prompt: "Create customer personas who would benefit most from this product"
      },
      {
        title: "Satisfaction Boosters",
        prompt: "Suggest ways to improve customer satisfaction with this product"
      }
    ]
  },
  { 
    id: 'improvement', 
    name: 'Improvement Ideas', 
    icon: <Zap size={20} className="text-yellow-300" />,
    gradient: "from-yellow-600/20 to-yellow-400/20",
    borderColor: "border-yellow-500",
    templates: [
      {
        title: "Feature Enhancements",
        prompt: "Suggest 5 feature enhancements based on current market trends"
      },
      {
        title: "Packaging Improvements",
        prompt: "How can we improve the product packaging or presentation?"
      },
      {
        title: "Complementary Services",
        prompt: "What additional services could complement this product?"
      },
      {
        title: "Weakness Remediation",
        prompt: "Identify potential weak points and how to address them"
      },
      {
        title: "Sustainability Ideas",
        prompt: "How can we make this product more sustainable or eco-friendly?"
      }
    ]
  },
  { 
    id: 'selling', 
    name: 'Key Selling Points', 
    icon: <Star size={20} className="text-red-300" />,
    gradient: "from-red-600/20 to-red-400/20",
    borderColor: "border-red-500",
    templates: [
      {
        title: "Top Benefits",
        prompt: "What are the top 5 benefits I should highlight in marketing?"
      },
      {
        title: "Listing Bullet Points",
        prompt: "Generate concise bullet points for product listings"
      },
      {
        title: "Value Statements",
        prompt: "Create persuasive statements about product value for different channels"
      },
      {
        title: "Emotional Appeals",
        prompt: "What emotional appeals work best for this type of product?"
      },
      {
        title: "Elevator Pitch",
        prompt: "Develop a 30-second elevator pitch for this product"
      }
    ]
  },
  { 
    id: 'description', 
    name: 'Product Description', 
    icon: <FileText size={20} className="text-purple-300" />,
    gradient: "from-purple-600/20 to-purple-400/20",
    borderColor: "border-purple-500",
    templates: [
      {
        title: "Comprehensive Description",
        prompt: "Write a comprehensive product description highlighting features and benefits"
      },
      {
        title: "Technical Specifications",
        prompt: "Create a technical specification list in consumer-friendly language"
      },
      {
        title: "Multi-platform Content",
        prompt: "Generate product descriptions for different platforms (Amazon, website, catalog)"
      },
      {
        title: "Story-based Description",
        prompt: "Write a story-based description that connects with customer needs"
      },
      {
        title: "Comparison Table",
        prompt: "Create a comparison table highlighting advantages over generic alternatives"
      }
    ]
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
  const [selectedCategory, setSelectedCategory] = useState(null);
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
  
  // Filter insights based on selected type
  const filteredInsights = insightType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === insightType || insight.type === 'welcome');
  
  // Scroll to bottom of insights
  useEffect(() => {
    insightsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [insights, insightType]);
  
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
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    if (category.id === 'all') {
      setInsightType('all');
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Handle back from template selection
  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };
  
  // Handle template selection
  const handleTemplateSelect = async (template, category) => {
    if (chatLoading || !selectedProduct) return;
    
    // Add user request to insights
    const userInsight = {
      id: `user-${Date.now()}`,
      type: category.id,
      title: template.title,
      content: template.prompt,
      format: 'text',
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setInsights(prev => [...prev, userInsight]);
    setSelectedCategory(null);
    setInsightType(category.id);
    
    try {
      // Add loading indicator
      const loadingId = `loading-${Date.now()}`;
      setInsights(prev => [...prev, { 
        id: loadingId, 
        type: category.id,
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
            message: template.prompt,
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
          type: category.id,
          title: template.title,
          content: response.data.chat.content,
          format: response.data.chat.format,
          webDataUsed: response.data.chat.webDataUsed,
          timestamp: new Date().toISOString()
        }];
      });
      
    } catch (error) {
      console.error('Error sending template request:', error);
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
  
  // Get styles for a specific insight type
  const getInsightStyles = (type) => {
    const category = INSIGHT_CATEGORIES.find(cat => cat.id === type);
    if (!category) {
      return {
        gradient: 'from-gray-700/50 to-gray-800/50',
        border: 'border-gray-700'
      };
    }
    return {
      gradient: category.gradient,
      border: category.borderColor
    };
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
  
  // If no product is selected, show product selector
  if (!selectedProduct && !showProductSelector) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700 shadow-xl"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
              animate={{ 
                boxShadow: ['0 0 0 rgba(139, 92, 246, 0)', '0 0 20px rgba(139, 92, 246, 0.5)', '0 0 0 rgba(139, 92, 246, 0)'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb size={30} className="text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Product Genius</h2>
          <p className="text-gray-400 text-center mb-6">
            Ask anything about your product! Get instant answers, improvement tips, and even predict customer questions.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowProductSelector(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl border border-purple-500/50 hover:from-purple-600/40 hover:to-blue-600/40 transition-all flex items-center justify-center"
            >
              <Package size={18} className="mr-2 text-purple-400" />
              <span>Select a Product</span>
            </button>
            
            {productsLoading && (
              <div className="text-center text-sm text-gray-500">
                Loading your products...
              </div>
            )}
            
            {productsError && (
              <div className="text-center text-sm text-red-400">
                Error loading products. Please try again.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col relative">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-b border-gray-700 p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
              <Lightbulb size={20} className="text-white" />
            </div>
            
            <div>
              <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Product Genius
              </h2>
              
              {selectedProduct && (
                <button 
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="flex items-center text-sm text-gray-300 hover:text-white"
                >
                  {selectedProduct.name}
                  <ChevronDown size={14} className="ml-1" />
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setSearchWeb(!searchWeb)}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              searchWeb 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {searchWeb ? <Wifi size={14} className="mr-1.5" /> : <WifiOff size={14} className="mr-1.5" />}
            {searchWeb ? 'Web Search: ON' : 'Web Search: OFF'}
          </button>
        </div>
      </div>
      
      {/* Product Selector Dropdown */}
      <AnimatePresence>
        {showProductSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 left-4 z-50 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
          >
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2">
              {productsLoading ? (
                <div className="text-center p-4 text-sm text-gray-500">Loading products...</div>
              ) : productsError ? (
                <div className="text-center p-4 text-sm text-red-400">Error loading products</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center p-4 text-sm text-gray-500">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <motion.button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full p-2 flex items-center text-left hover:bg-gray-700/50 rounded-md transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
      
      {/* Category / Template Selector Area */}
      <div className="p-4 border-b border-gray-700/50">
        {selectedCategory ? (
          <div>
            <button 
              onClick={handleBackToCategories}
              className="flex items-center text-sm text-gray-400 hover:text-white mb-3"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to categories
            </button>
            
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedCategory.gradient} flex items-center justify-center mr-2`}>
                {selectedCategory.icon}
              </div>
              <h3 className="text-lg font-medium">{selectedCategory.name} Templates</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {selectedCategory.templates?.map((template, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleTemplateSelect(template, selectedCategory)}
                  disabled={chatLoading}
                  className={`p-3 text-left rounded-lg border backdrop-blur-sm bg-gradient-to-br ${selectedCategory.gradient} ${selectedCategory.borderColor} hover:shadow-lg transition-all`}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium mb-1">{template.title}</div>
                  <div className="text-sm text-gray-300">{template.prompt}</div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
            {INSIGHT_CATEGORIES.map(category => (
              <motion.button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 py-2 rounded-lg border whitespace-nowrap flex items-center ${
                  insightType === category.id 
                    ? `bg-gradient-to-r ${category.gradient} ${category.borderColor}` 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        )}
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
              <p className="text-sm">Select a category above or ask a custom question below</p>
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