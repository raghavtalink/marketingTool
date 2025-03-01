import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, Globe, Wifi, WifiOff, ChevronDown, Search, Package, Zap, Sparkles, TrendingUp, Users, ShoppingCart, FileText } from 'lucide-react';
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

const ProductGenius = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [insightCards, setInsightCards] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [inputMessage, setInputMessage] = useState('');
  const [searchWeb, setSearchWeb] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  
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
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
    setInsightCards([
      {
        id: 'welcome',
        title: 'Product Insights',
        content: `I'm ready to analyze your "${product.name}" product! Select an insight card or ask me anything.`,
        type: 'welcome',
        format: 'text'
      }
    ]);
  };
  
  // Predefined insight card types with their icons and prompts
  const insightTypes = [
    { id: 'market', name: 'Market Analysis', icon: <TrendingUp size={18} />, prompt: 'Perform a detailed market analysis for this product, including competitors, positioning, and market opportunities.' },
    { id: 'customers', name: 'Customer Insights', icon: <Users size={18} />, prompt: 'Analyze potential customer segments, their needs, and how this product addresses them.' },
    { id: 'improvements', name: 'Improvement Ideas', icon: <Sparkles size={18} />, prompt: 'Suggest potential improvements or optimizations for this product to increase its value and appeal.' },
    { id: 'selling', name: 'Selling Points', icon: <ShoppingCart size={18} />, prompt: 'Identify and elaborate on the key selling points that make this product unique or valuable.' },
    { id: 'description', name: 'Product Description', icon: <FileText size={18} />, prompt: 'Generate a compelling, detailed product description that highlights features and benefits.' }
  ];
  
  // Generate a specific insight card
  const generateInsightCard = async (type) => {
    if (!selectedProduct) return;
    
    const insightType = insightTypes.find(t => t.id === type);
    if (!insightType) return;
    
    // Show generating state
    setIsGenerating(true);
    
    try {
      // Prepare chat input
      const chatInput = {
        searchWeb,
        productId: selectedProduct.id,
        messages: [
          {
            message: insightType.prompt,
            sender: 'null'
          }
        ]
      };
      
      // Send to API
      const response = await sendChat({ variables: { input: chatInput } });
      
      // Add new insight card
      const newCard = {
        id: `${type}-${Date.now()}`,
        title: insightType.name,
        content: response.data.chat.content,
        format: response.data.chat.format,
        type: type,
        icon: insightType.icon,
        webDataUsed: response.data.chat.webDataUsed
      };
      
      setInsightCards(prev => [newCard, ...prev.filter(card => card.type !== 'welcome')]);
      
    } catch (error) {
      console.error('Error generating insight:', error);
      
      // Add error card
      setInsightCards(prev => [
        {
          id: `error-${Date.now()}`,
          title: 'Error',
          content: 'Sorry, I encountered an error generating this insight. Please try again.',
          type: 'error',
          format: 'text'
        },
        ...prev
      ]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle sending a custom message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProduct) return;
    
    setIsGenerating(true);
    
    try {
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
      
      // Add new insight card
      const newCard = {
        id: `custom-${Date.now()}`,
        title: 'Custom Insight',
        query: inputMessage,
        content: response.data.chat.content,
        format: response.data.chat.format,
        type: 'custom',
        icon: <Zap size={18} />,
        webDataUsed: response.data.chat.webDataUsed
      };
      
      setInsightCards(prev => [newCard, ...prev.filter(card => card.type !== 'welcome')]);
      setInputMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error card
      setInsightCards(prev => [
        {
          id: `error-${Date.now()}`,
          title: 'Error',
          content: 'Sorry, I encountered an error analyzing your request. Please try again.',
          type: 'error',
          format: 'text'
        },
        ...prev
      ]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Render content based on format
  const renderCardContent = (card) => {
    if (card.format === 'thinking' || isGenerating) {
      return (
        <div className="flex space-x-2 items-center">
          <motion.div 
            className="h-2 w-2 bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <motion.div 
            className="h-2 w-2 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div 
            className="h-2 w-2 bg-pink-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      );
    }
    
    if (card.format === 'html') {
      return (
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: card.content }}
        />
      );
    }
    
    return <p>{card.content}</p>;
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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Lightbulb size={28} className="text-white" />
            </div>
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
        
        {/* Insight Type Tabs */}
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white' 
                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
            }`}
          >
            All Insights
          </button>
          
          {insightTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                activeTab === type.id 
                  ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white' 
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
              }`}
            >
              {React.cloneElement(type.icon, { size: 12, className: 'mr-1.5' })}
              {type.name}
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
            className="absolute top-24 left-4 z-50 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
          >
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto py-2">
              {productsLoading ? (
                <div className="px-4 py-2 text-gray-400 text-sm">Loading products...</div>
              ) : productsError ? (
                <div className="px-4 py-2 text-red-400 text-sm">Error loading products</div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-2 text-gray-400 text-sm">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center ${
                      selectedProduct?.id === product.id ? 'bg-gray-700' : ''
                    }`}
                  >
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-600 mr-2 flex items-center justify-center">
                        <Package size={14} />
                      </div>
                    )}
                    <div>
                      <div>{product.name}</div>
                      <div className="text-xs text-gray-400">{product.category}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Insight Buttons (only show if we have a product selected) */}
      {selectedProduct && insightCards.length > 0 && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {insightTypes.map(type => (
            <button
              key={type.id}
              onClick={() => generateInsightCard(type.id)}
              disabled={isGenerating}
              className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-2 group-hover:from-purple-500/30 group-hover:to-blue-500/30">
                {React.cloneElement(type.icon, { className: "text-purple-300" })}
              </div>
              <span className="text-xs text-center text-gray-300">{type.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Insight Cards */}
      <div className="flex-1 overflow-y-auto p-4 pb-36 space-y-4">
        <AnimatePresence>
          {insightCards
            .filter(card => activeTab === 'all' || card.type === activeTab || card.type === 'welcome')
            .map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    {card.icon && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center mr-3">
                        {card.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{card.title}</h3>
                      {card.query && (
                        <p className="text-xs text-gray-400">{card.query}</p>
                      )}
                    </div>
                  </div>
                  
                  {card.webDataUsed && (
                    <div className="flex items-center text-xs text-blue-400">
                      <Globe size={12} className="mr-1" />
                      Web data used
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  {renderCardContent(card)}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        
        {insightCards.length === 0 && !isGenerating && (
          <div className="h-full flex items-center justify-center text-gray-500 text-center p-6">
            <div>
              <Lightbulb size={32} className="mx-auto mb-3 opacity-50" />
              <p>Select an insight type above or ask a custom question to get started!</p>
            </div>
          </div>
        )}
        
        {isGenerating && insightCards.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex space-x-2 items-center">
              <motion.div 
                className="h-3 w-3 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <motion.div 
                className="h-3 w-3 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div 
                className="h-3 w-3 bg-pink-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
            <p className="mt-4 text-gray-400">Generating insights for your product...</p>
          </div>
        )}
      </div>
      
      {/* Absolutely Positioned Input Area at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-b-xl">
        <div className="p-4">
          <div className="flex items-center">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a custom question about your product..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              rows="1"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !inputMessage.trim()}
              className={`ml-2 p-3 rounded-full ${
                isGenerating || !inputMessage.trim()
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              } transition-all`}
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Lightbulb size={12} className="mr-1" />
            Try asking about specific aspects of your product or market opportunities
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGenius;