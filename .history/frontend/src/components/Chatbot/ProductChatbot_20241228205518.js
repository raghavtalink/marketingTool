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

        let currentBotMessage = { sender: 'bot', message: '' };
        setMessages(prev => [...prev, currentBotMessage]);

        await chatWithProduct(chatHistory, (data) => {
            currentBotMessage.message = formatBotResponse(data.full_response);
            setMessages(prev => [...prev.slice(0, -1), { ...currentBotMessage }]);
        });

    } catch (err) {
        console.error('Chat error:', err);
        setError(err.response?.data?.detail || 'Failed to communicate with the bot');
        setMessages(prev => prev.slice(0, -1)); // Remove the incomplete bot message
    } finally {
        setIsLoading(false);
    }
};

const formatBotResponse = (message) => {
    if (!message) return { intro: '', items: [] };

    // Split message into paragraphs
    const paragraphs = message.split(/\n\n+/);
    
    // Check if message contains lists (numbered or bulleted)
    const hasLists = message.match(/(?:\d+\.|\-|\*)\s+[^\n]+/g);

    if (hasLists) {
        const intro = paragraphs[0];
        const items = message
            .match(/(?:\d+\.|\-|\*)\s+[^\n]+/g)
            ?.map(item => item.replace(/(?:\d+\.|\-|\*)\s+/, '')) || [];
        return { intro, items };
    }

    // Format regular message with paragraphs
    return {
        intro: paragraphs[0],
        items: paragraphs.slice(1)
    };
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
                <p className="message-text">
                    {typeof msg.message === 'string' ? msg.message : msg.message.intro}
                </p>
                {msg.message.items && msg.message.items.length > 0 && (
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