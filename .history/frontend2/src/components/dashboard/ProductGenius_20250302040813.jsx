import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, Globe, Wifi, WifiOff, ChevronDown, Search, Package } from 'lucide-react';
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
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchWeb, setSearchWeb] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
    // Add welcome message
    setMessages([
      {
        sender: 'ai',
        content: `I'm ready to help with your "${product.name}" product! Ask me anything about it, request improvement tips, or explore potential customer questions.`,
        format: 'text'
      }
    ]);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProduct) return;
    
    // Add user message to chat
    const userMessage = {
      sender: 'user',
      content: inputMessage,
      format: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
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
      
      // Add thinking indicator
      setMessages(prev => [...prev, { sender: 'ai', content: '...', format: 'thinking' }]);
      
      // Send to API
      const response = await sendChat({ variables: { input: chatInput } });
      
      // Remove thinking indicator and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.format !== 'thinking');
        return [...filtered, {
          sender: 'ai',
          content: response.data.chat.content,
          format: response.data.chat.format,
          webDataUsed: response.data.chat.webDataUsed
        }];
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove thinking indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.format !== 'thinking');
        return [...filtered, {
          sender: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          format: 'text'
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
  
  // Render message content based on format
  const renderMessageContent = (message) => {
    if (message.format === 'thinking') {
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
    
    if (message.format === 'html') {
      return (
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      );
    }
    
    return <p>{message.content}</p>;
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
            Ask anything about your product! Get instant answers, improvement tips, and even predict customer questions—all powered by AI.
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
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-b border-gray-700 p-4 rounded-t-xl">
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
      
      {/* Scrollable Chat Messages Area - flex-1 makes it take all available space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-auto" />
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-center p-6">
            <div>
              <Lightbulb size={32} className="mx-auto mb-3 opacity-50" />
              <p>Ask anything about your product to get started!</p>
              <p className="text-sm mt-2">Try questions about improvements, market comparisons, or customer FAQs</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3xl rounded-2xl p-4 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white' 
                      : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700'
                  }`}
                >
                  {renderMessageContent(message)}
                  
                  {message.sender === 'ai' && message.webDataUsed && (
                    <div className="mt-2 flex items-center text-xs text-blue-400">
                      <Globe size={12} className="mr-1" />
                      Web data was used to generate this response
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Fixed Input Area at Bottom */}
      <div className="mt-auto border-t border-gray-700 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-b-xl">
        <div className="p-4">
          <div className="flex items-center">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your product..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={chatLoading || !inputMessage.trim()}
              className={`ml-2 p-3 rounded-full ${
                chatLoading || !inputMessage.trim()
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              } transition-all`}
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Lightbulb size={12} className="mr-1" />
            Try asking about market comparisons, improvement suggestions, or customer FAQs
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGenius;