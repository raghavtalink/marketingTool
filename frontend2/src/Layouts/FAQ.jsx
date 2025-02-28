import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Blob Animation Component
const BlobAnimation = ({ delay, className }) => {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ 
        scale: [0.8, 1.2, 0.8],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay || 0,
      }}
    />
  );
};

const FAQComponent = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [openItem, setOpenItem] = useState('Is there a free trial available?');
  
  const tabs = ['General', 'Pricing'];
  
  const faqItems = [
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, you can try us for free for 30 days. If you want, we\'ll provide you with a free 30-minute onboarding call to get you up and running. Book a call here.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      )
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time through your account settings.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2"></rect>
          <path d="M16 2v4"></path>
          <path d="M8 2v4"></path>
          <path d="M3 10h18"></path>
        </svg>
      )
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'You can cancel your subscription at any time, and you won\'t be charged for the following billing cycle.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      question: 'Can other info be added to an invoice?',
      answer: 'Yes, you can add custom fields and information to your invoices through the billing settings.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21l-8.5-8.5c-1.4-1.4-1.4-3.6 0-5l8.5-8.5 8.5 8.5c1.4 1.4 1.4 3.6 0 5L12 21z"></path>
        </svg>
      )
    },
    {
      question: 'How does billing work?',
      answer: 'We offer monthly and annual billing options. You\'ll be charged at the beginning of each billing cycle.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    },
    {
      question: 'How do I change my account email?',
      answer: 'You can update your email address in your account settings. After changing it, we\'ll send a verification email to your new address.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    },
    {
      question: 'How does support work?',
      answer: 'Our support team is available 24/7. You can reach us via email, live chat, or through our help center.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      question: 'Do you provide tutorials?',
      answer: 'Yes, we offer comprehensive tutorials, webinars, and documentation to help you get the most out of our platform.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    }
  ];
  
  const toggleItem = (question) => {
    setOpenItem(openItem === question ? null : question);
  };
  
  return (
    <div className="bg-black-900 min-h-screen text-gray-100 p-6 relative">
      {/* Animated Blob Background */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-20">
        <BlobAnimation
          delay={0}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation
          delay={5}
          className="absolute top-0 -right-20 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation
          delay={2.5}
          className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <BlobAnimation
          delay={7.5}
          className="absolute top-40 right-40 w-60 h-60 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>
      
      <div className="max-w-3xl mx-auto pt-10 pb-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Frequently asked questions</h1>
          <p className="text-gray-400 mb-2">
            These are the most commonly asked questions about Untitled UI.
          </p>
          <p className="text-gray-400">
            Can't find what you're looking for? <a href="#" className="text-blue-400 hover:text-blue-300">Chat to our friendly team!</a>
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item) => (
            <motion.div 
              key={item.question} 
              className="border border-gray-800 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <button
                onClick={() => toggleItem(item.question)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center">
                  <div className="text-gray-400 mr-3">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.question}</span>
                </div>
                <motion.svg
                  animate={{ rotate: openItem === item.question ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </motion.svg>
              </button>
              
              {openItem === item.question && (
                <motion.div 
                  className="p-4 pt-0 text-gray-400 border-t border-gray-800"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0 }}
                >
                  {item.answer}
                  {item.question === 'Is there a free trial available?' && (
                    <a href="#" className="text-blue-400 hover:text-blue-300"> here</a>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQComponent;