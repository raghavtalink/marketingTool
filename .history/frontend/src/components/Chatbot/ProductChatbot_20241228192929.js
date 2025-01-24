import React, { useState, useEffect } from 'react';
import { chatWithProduct } from '../../services/content';

const ProductChatbot = ({ product_id }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', message: 'Hello! How can I assist you with your product today?' },
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', message: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const chatHistory = {
        product_id,
        messages: updatedMessages,
      };
      const response = await chatWithProduct(chatHistory);
      setMessages(response.messages);
    } catch (err) {
      console.error('Chat error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to communicate with the bot');
    }
  };

  return (
    <div className="product-chatbot-container">
      <h3>Chat with Your Product</h3>
      {error && <p className="error">{error}</p>}
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'You' : 'Product'}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ProductChatbot;