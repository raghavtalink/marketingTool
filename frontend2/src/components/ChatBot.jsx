import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const mockResponses = [
    "I'm here to help! What would you like to know?",
    "That's an interesting question. Let me think about that.",
    "I understand your concern. Here's what I suggest...",
    "Thanks for sharing that information with me.",
    "I'd be happy to assist you with that request."
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user"
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response after delay
    setTimeout(() => {
      setIsTyping(false);
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const newBotMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: "bot"
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    }, 1500);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800"
            style={{ width: '350px', height: '500px' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white p-4 shadow-md flex justify-between items-center">
              <h1 className="text-xl font-bold">ChatBot</h1>
              <button 
                onClick={toggleChat}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-800 text-gray-100 rounded-lg rounded-bl-none p-3">
                      <motion.div
                        className="flex space-x-1"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-pink-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endOfMessagesRef} />
            </div>
            
            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your message here..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
                  type="submit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle button */}
      <motion.button
        className="rounded-full shadow-lg p-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ rotate: 90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatBot;