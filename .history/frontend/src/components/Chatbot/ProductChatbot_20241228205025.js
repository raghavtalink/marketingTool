import React, { useState, useEffect } from 'react';
import { getProducts } from '../../services/products';
import { chatWithProduct } from '../../services/content';
import './ProductChatbot.css';

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

    const userMessage = { sender: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
        const chatHistory = {
            product_id: selectedProduct,
            messages: [...messages, userMessage],
        };
        const response = await chatWithProduct(chatHistory);
        
        if (response && response.messages) {
            const formattedMessages = response.messages.map(msg => {
                if (msg.sender === 'bot') {
                    const message = formatBotResponse(msg.message);
                    return { ...msg, message };
                }
                return msg;
            });
            setMessages(formattedMessages);
        } else {
            const botMessage = { 
                sender: 'bot', 
                message: formatBotResponse(response.content || 'I apologize, but I encountered an issue processing your request.')
            };
            setMessages(prev => [...prev, botMessage]);
        }
    } catch (err) {
        console.error('Chat error:', err);
        setError(err.response?.data?.detail || 'Failed to communicate with the bot');
    } finally {
        setIsLoading(false);
    }
  };

  const formatBotResponse = (message) => {
    // Check if message is a string
    if (typeof message !== 'string') {
        return {
            intro: 'I apologize, but I encountered an issue processing your request.',
            items: []
        };
    }

    // Check if the message contains a numbered list
    if (message.includes(':') && message.match(/\d+\./)) {
        const [intro, ...items] = message.split(/(?=\d+\.)/);
        return {
            intro: intro.trim(),
            items: items.map(item => item.replace(/^\d+\./, '').trim())
        };
    }
    // Return regular message
    return { intro: message, items: [] };
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
            {msg.sender === 'bot' ? (
              <div className="bot-message">
                <p className="message-text">{msg.message.intro}</p>
                {msg.message.items.length > 0 && (
                  <ol className="message-list">
                    {msg.message.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                )}
              </div>
            ) : (
              <div className="user-message">
                <p className="message-text">{msg.message}</p>
              </div>
            )}
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