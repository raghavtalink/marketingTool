import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PricingTable = () => {
  const [isYearly, setIsYearly] = useState(true);
  
  const getTiers = (isYearly) => [
    {
      name: "Freeloader",
      description: "Perfect for getting started with e-commerce automation",
      priceUSD: "Free",
      priceINR: "Free",
      color: "var(--freeloader-color)",
      features: [
        { name: "AI Content Generator", detail: "Generate up to 3 listings/month" },
        { name: "Competitor Analysis", detail: "Analyze 1 competitor listing/week" },
        { name: "Pricing Strategy", detail: "Simple pricing tips" },
        { name: "Social Media Content", detail: "5 captions/month" },
        { name: "Image Creator", detail: "3 images/month" },
        { name: "Market Trends", detail: "1 trend report/month" }
      ]
    },
    {
      name: "Hustler",
      description: "For growing businesses ready to scale",
      priceUSD: isYearly ? "$15" : "$20",
      priceINR: isYearly ? "₹999" : "₹1,499",
      color: "var(--hustler-color)",
      features: [
        { name: "AI Content Generator", detail: "Unlimited listings" },
        { name: "Competitor Analysis", detail: "Up to 10 competitor listings/month" },
        { name: "Pricing Strategy", detail: "Advanced pricing with cost/profit analysis" },
        { name: "Social Media Content", detail: "50 captions/month" },
        { name: "Image Creator", detail: "25 images/month" },
        { name: "Market Trends", detail: "Weekly trend reports" }
      ]
    },
    {
      name: "Trailblazer",
      description: "For serious sellers aiming for market leadership",
      priceUSD: isYearly ? "$60" : "$80",
      priceINR: isYearly ? "₹4,999" : "₹6,499",
      color: "var(--trailblazer-color)",
      features: [
        { name: "AI Content Generator", detail: "Unlimited listings with multi-language support" },
        { name: "Competitor Analysis", detail: "Unlimited competitor insights" },
        { name: "Pricing Strategy", detail: "Dynamic pricing based on real-time market data" },
        { name: "Social Media Content", detail: "Unlimited captions with audience targeting" },
        { name: "Image Creator", detail: "Unlimited images with advanced editing features" },
        { name: "Market Trends", detail: "Real-time trend analysis and forecasting" }
      ]
    }
  ];

  const plans = getTiers(isYearly);

  // CSS variables for colors
  const rootStyle = {
    "--freeloader-color": "#6C63FF",
    "--hustler-color": "#00C853",
    "--trailblazer-color": "#FF5722",
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  const featureItem = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };

  return (
    <div className="bg-black  text-white min-h-screen relative overflow-hidden" style={rootStyle}>
      
      <motion.h1 
        key="pricing-heading" 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-8xl md:text-9xl font-bold text-center absolute w-full top-10 md:top-16 z-0"
      >
        Pricing
      </motion.h1>
      
      
      <div className="relative z-10 pt-32 md:pt-40 px-4 pb-16">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row justify-center gap-4 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div 
              key={`${plan.name}-${isYearly}`} // Updated key to include pricing state
              variants={item}
              whileHover={{ 
                y: -10,
                boxShadow: `0 10px 25px -5px rgba(${plan.color === 'var(--freeloader-color)' ? '108, 99, 255' : 
                             plan.color === 'var(--hustler-color)' ? '0, 200, 83' : 
                             '255, 87, 34'}, 0.2)`
              }}
              className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 flex-1 flex flex-col border border-zinc-800"
            >
              <div className="mb-6">
                <p className="text-sm text-zinc-400">{plan.name}</p>
                <motion.h2 
                  className="text-4xl font-bold mt-1"
                  key={`price-${plan.name}-${isYearly}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.priceUSD}/mo
                </motion.h2>
                <motion.p 
                  className="text-sm text-zinc-400 mt-1"
                  key={`price-inr-${plan.name}-${isYearly}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.priceINR}/mo
                </motion.p>
                <p className="text-xs text-zinc-500 mt-2">{plan.description}</p>
              </div>
              
              <div className="flex-grow">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {plan.features.map((feature, i) => (
                    <motion.div 
                      key={`${plan.name}-feature-${i}-${isYearly}`} // Updated key
                      variants={featureItem}
                      className="flex items-start"
                    >
                      <motion.div 
                        className="bg-zinc-800 rounded-full p-1 mr-3 mt-1"
                        whileHover={{ scale: 1.2 }}
                        style={{ color: plan.color }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                      <div>
                        <span className="text-sm text-zinc-200 font-medium block">{feature.name}</span>
                        <span className="text-xs text-zinc-400">{feature.detail}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 py-3 px-4 rounded-md w-full font-medium"
                style={{
                  backgroundColor: index === 0 ? 'transparent' : plan.color,
                  border: `1px solid ${plan.color}`,
                  color: index === 0 ? plan.color : 'white'
                }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="flex justify-center items-center mt-12">
          <motion.span 
            className={`mr-3 text-sm ${!isYearly ? 'font-medium text-white' : 'text-zinc-400'}`}
            animate={{ opacity: !isYearly ? 1 : 0.6 }}
          >
            Monthly
          </motion.span>
          <motion.div 
            className="bg-zinc-800 rounded-full p-1 w-12 h-6 flex items-center cursor-pointer"
            onClick={() => setIsYearly(!isYearly)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div 
              className="bg-white rounded-full w-4 h-4"
              animate={{ 
                x: isYearly ? 24 : 0 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
            ></motion.div>
          </motion.div>
          <motion.span 
            className={`ml-3 text-sm ${isYearly ? 'font-medium text-white' : 'text-zinc-400'}`}
            animate={{ opacity: isYearly ? 1 : 0.6 }}
          >
            Yearly <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isYearly ? 1 : 0 }}
                      className="text-green-500 text-xs ml-1"
                    >
                      Save 25%
                    </motion.span>
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export default PricingTable