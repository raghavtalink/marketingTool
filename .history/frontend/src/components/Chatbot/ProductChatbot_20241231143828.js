import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { chatWithProduct } from '../../services/content';
import './ProductChatbot.css';
import BotResponse from './BotResponse';  

const ProductChatbot = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = (e) => {
    setSelectedProduct(e.target.value);
    setMessages([
      { 
        sender: 'bot', 
        message: 'Hello! How can I help you with this product today?' 
      }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedProduct) return;

    const userMessage = {
        sender: 'user',
        message: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const chatHistory = {
            product_id: selectedProduct,
            messages: [...messages, userMessage].map(msg => ({
                sender: msg.sender === 'bot' ? 'assistant' : 'user',
                message: typeof msg.message === 'object' ? 
                    msg.message.intro + '\n' + msg.message.items.join('\n') : 
                    msg.message
            }))
        };

        const response = await chatWithProduct(chatHistory);
        setMessages(prev => [...prev, {
            sender: 'bot',
            message: response
        }]);
    } catch (err) {
        setError('Failed to send message');
        console.error('Chat error:', err);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Product Chatbot</h2>
        <select 
          value={selectedProduct} 
          onChange={handleProductSelect}
          className="product-select"
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-window">
      {messages.map((msg, index) => (
    <div key={index} className={`message ${msg.sender}`}>
        <div className={`${msg.sender}-message`}>
            {msg.sender === 'bot' ? (
                <BotResponse htmlContent={msg.message} isSEO={false} />
            ) : (
                <p className="message-text">{msg.message}</p>
            )}
        </div>
    </div>
))}
        {isLoading && (
            <div className="message bot">
                <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        )}
      </div>

      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={!selectedProduct || isLoading}
        />
        <button type="submit" disabled={!selectedProduct || !input.trim() || isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ProductChatbot;