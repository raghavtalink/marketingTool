import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer';
import { 
  Home, 
  Package, 
  Box, 
  Lightbulb, 
  DollarSign, 
  Camera, 
  TrendingUp, 
  Megaphone,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

const FeaturesPage = () => {
  // State for active feature
  const [activeFeature, setActiveFeature] = useState(null);
  // State for modal
  const [modalFeature, setModalFeature] = useState(null);
  
  // Ref for the container
  const containerRef = useRef(null);
  
  // Get scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Sample features data - replace with your actual content
  const features = [
    {
      id: 1,
      title: "Listing Wizard",
      description: "Our AI-powered content generator learns your style over time, making your listing creation smoother and more efficient.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-purple-500 to-indigo-600",
      category: "content",
      icon: <Package size={30} />,
      why: "Empower your e-commerce journey with smart, SEO-optimized listing content designed for online sellers. This tool integrates seamlessly with your workflow, providing immediate value as you grow.",
      capabilities: [
        "Generates compelling, SEO-rich product titles, descriptions & keywords",
        "Optimizes listings for better search rankings and visibility",
        "Adapts to different e-commerce platforms (Amazon, Shopify, Etsy, etc.)",
        "Ensures brand consistency across all listings"
      ],
      cta: "Ready to transform your product listings?"
    },
    {
      id: 2,
      title: "Bundle Builder",
      description: "Our AI-powered product combo analyzer suggests high-converting product combinations, increasing your sales potential.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-blue-500 to-cyan-600",
      category: "sales",
      icon: <Box size={30} />,
      why: "Boost your revenue by offering the right product bundles. Our AI analyzes buying patterns and market demand to suggest profitable product pairings that customers love.",
      capabilities: [
        "Analyzes sales data to recommend best-selling product combos",
        "Identifies cross-sell & up-sell opportunities",
        "Provides data-backed pricing suggestions for bundles",
        "Helps create attractive, high-value offers for customers"
      ],
      cta: "Ready to transform your product bundling strategy?"
    },
    {
      id: 3,
      title: "Product Genius",
      description: "Our AI-driven chatbot understands your products deeply, offering real-time insights and recommendations.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-emerald-500 to-teal-600",
      category: "insights",
      icon: <Lightbulb size={30} />,
      why: "Enhance product knowledge with an AI chatbot that delivers instant analysis, competitive insights, and suggestions to optimize your product listings.",
      capabilities: [
        "Answers product-related queries instantly",
        "Analyzes product strengths and areas for improvement",
        "Suggests ways to make your listing more appealing",
        "Provides AI-powered competitor comparisons"
      ],
      cta: "Ready to get AI-powered product insights?"
    },
    {
      id: 4,
      title: "Price Pilot",
      description: "Our AI-powered pricing tool dynamically adjusts product prices for maximum profitability and competitiveness.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-amber-500 to-orange-600",
      category: "pricing",
      icon: <DollarSign size={30} />,
      why: "Stop guessing and start pricing smartly. Our AI evaluates market trends, competition, and demand to recommend the best pricing strategies for your products.",
      capabilities: [
        "Dynamic pricing suggestions based on competitor analysis",
        "Helps set profitable price points for new & existing products",
        "Tracks pricing trends in real time",
        "Provides discount and promotional pricing recommendations"
      ],
      cta: "Ready to optimize your pricing strategy?"
    },
    {
      id: 5,
      title: "Instant Studio",
      description: "Our AI-powered image creation tool generates stunning, studio-quality product images in seconds.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-red-500 to-rose-600",
      category: "media",
      icon: <Camera size={30} />,
      why: "Create eye-catching, professional images without the need for a photoshoot. AI-enhanced visuals drive more clicks, conversions, and customer trust.",
      capabilities: [
        "Generates high-quality, realistic product images",
        "Removes backgrounds and enhances image clarity",
        "Offers pre-set templates for quick editing",
        "Supports branding with custom colors, fonts, and overlays"
      ],
      cta: "Ready to level up your product visuals?"
    },
    {
      id: 6,
      title: "TrendSpot",
      description: "Our AI-powered market trends tool provides deep insights into product demand and competitor movements.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-violet-500 to-purple-600",
      category: "insights",
      icon: <TrendingUp size={30} />,
      why: "Stay ahead of the competition by tracking emerging trends, pricing fluctuations, and high-demand products in real time.",
      capabilities: [
        "Monitors trending products and categories",
        "Provides competitor pricing and performance insights",
        "Predicts demand shifts based on AI analysis",
        "Helps discover new product opportunities"
      ],
      cta: "Ready to dominate your market?"
    },
    {
      id: 7,
      title: "Ad Crafter",
      description: "Our AI-powered campaign designer creates high-impact, targeted ad campaigns for social media and e-commerce platforms.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-pink-500 to-fuchsia-600",
      category: "marketing",
      icon: <Megaphone size={30} />,
      why: "Simplify your marketing with AI-driven ad creation. Get automated ad copy, creatives, and targeting suggestions to maximize your ROI.",
      capabilities: [
        "Generates ad copy optimized for conversions",
        "Suggests the best-performing keywords & hashtags",
        "Designs social media creatives and ad banners",
        "Optimizes ad budgets with AI-driven performance tracking"
      ],
      cta: "Ready to supercharge your marketing campaigns?"
    }
  ];
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 80,
        damping: 20 
      }
    }
  };
  
  // Modal component
  const FeatureModal = ({ feature, onClose }) => {
    // Ref for detecting clicks outside the modal content
    const modalContentRef = useRef(null);
    
    // Close if clicking outside content area
    const handleBackdropClick = (e) => {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Handle escape key press
    useEffect(() => {
      const handleEscKey = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }, [onClose]);
    
    return (
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={modalContentRef}
          className={`relative max-w-4xl w-full overflow-hidden rounded-2xl bg-gray-800 bg-opacity-90 border border-gray-700 shadow-xl`}
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Glow effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-25 -z-10`}
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
          
          {/* Header */}
          <div className={`relative overflow-hidden h-40 bg-gradient-to-r ${feature.color}`}>
            {/* Animated particle effects */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5 + 0.2,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: [null, Math.random() * -20 - 10, null],
                    opacity: [null, Math.random() * 0.7 + 0.3, null],
                    scale: [null, Math.random() * 1 + 1, null]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: Math.random() * 3 + 2,
                    repeatType: "reverse" 
                  }}
                />
              ))}
            </div>
            
            {/* Header content */}
            <div className="relative z-10 flex items-center justify-between p-6 h-full">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full bg-gray-900 bg-opacity-50`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white p-2 rounded-full hover:bg-gray-900 hover:bg-opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
          
          {/* Modal body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="md:col-span-2 space-y-6">
                <motion.p 
                  className="text-lg text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {feature.description}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-bold text-xl text-white mb-3">Why it matters</h4>
                  <p className="text-gray-300">
                    {feature.why}
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <h4 className="font-bold text-xl text-white mb-3">Key capabilities</h4>
                  <ul className="space-y-2 text-gray-300">
                    {feature.capabilities.map((capability, index) => (
                      <li key={index} className="flex items-center">
                        <svg className={`h-5 w-5 mr-2 text-${feature.color.split('-')[1]}-500`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              
              {/* Feature image/video sidebar */}
              <motion.div 
                className="relative rounded-xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-70`} />
                
                <img 
                  src={feature.videoUrl} 
                  alt={`${feature.title} showcase`} 
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                
                {/* Interactive element indicators */}
                <motion.div 
                  className="absolute bottom-4 right-4 flex items-center space-x-2"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <p className="text-white text-xs font-medium">Interactive Demo</p>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Call to action */}
            <motion.div 
              className="mt-8 border-t border-gray-700 pt-6 flex flex-wrap justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-400 mb-4 md:mb-0">{feature.cta}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-6 py-3 rounded-full text-base font-medium text-white bg-gradient-to-r ${feature.color} shadow-lg`}
              >
                Get Started
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  const FeatureItem = ({ feature, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          delay: 0.1
        }}
        className="mb-32 relative"
      >
        {/* Glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.25, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-xl -z-10`}
        />
        
        <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 p-8 rounded-2xl overflow-hidden`}>
          {/* Video container */}
          <motion.div 
            className="w-full md:w-1/2 relative overflow-hidden rounded-xl shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-70`} />
            
            {/* Corner highlights */}
            <motion.div 
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white opacity-60"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white opacity-60"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white opacity-60"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white opacity-60"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
            />
            
            <video 
              className="w-full aspect-video object-cover relative z-10 mix-blend-overlay opacity-90"
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src={feature.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <img 
              src={feature.videoUrl} 
              alt={`${feature.title} demo`} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
            
            {/* Active highlight */}
            {activeFeature === feature.id && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 ring-4 ring-white ring-opacity-30 rounded-xl"
              />
            )}
          </motion.div>

          {/* Text content */}
          <div className="w-full md:w-1/2 space-y-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r ${feature.color} text-white shadow-lg`}
            >
              {feature.icon}
            </motion.div>
            
            <motion.h2 
              className={`text-3xl font-bold bg-gradient-to-r ${feature.color} text-transparent bg-clip-text`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              {feature.title}
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              {feature.description}
            </motion.p>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              onClick={() => setModalFeature(feature)}
              className={`mt-4 inline-flex items-center px-6 py-3 rounded-full 
                      text-base font-medium text-white bg-gradient-to-r ${feature.color}
                      shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
              Explore Feature
              <motion.svg 
                whileHover={{ x: 5 }}
                className="ml-2 -mr-1 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </motion.svg>
            </motion.button>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className={`absolute ${index % 2 === 0 ? '-right-4' : '-left-4'} top-1/4 w-24 h-24 pointer-events-none`}>
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-0 left-0 h-2 w-2 rounded-full bg-white"
          />
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 4, delay: 1 }}
            className="absolute top-4 left-8 h-3 w-3 rounded-full bg-white"
          />
          <motion.div 
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
            className="absolute top-10 left-2 h-1 w-1 rounded-full bg-white"
          />
        </div>
      </motion.div>
    );
  };

  // Background blob animations
  const BlobAnimation = ({ delay, className }) => {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.1, 0.9, 1],
          x: [0, 30, -20, 0],
          y: [0, -50, 20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 20,
          delay: delay,
          ease: "easeInOut"
        }}
        className={className}
      />
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black-900 pt-28 text-gray-100 overflow-x-hidden">
      {/* Animated background elements */}
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

      {/* Header with parallax effect - star background removed */}
      <motion.header
        className="relative py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
            >
              <motion.h1 
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="inline-block text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Powerful Features
              </motion.h1>
            </motion.div>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-xl text-center text-gray-300 max-w-3xl mx-auto"
            >
              Discover how our platform can transform your workflow with these game-changing features
            </motion.p>
            
            {/* Animated down arrow */}
            <motion.div 
              className="flex justify-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8"
      >
        {features.map((feature, index) => (
          <FeatureItem key={feature.id} feature={feature} index={index} />
        ))}
      </motion.div>
      
      {/* Modal Portal */}
      {modalFeature && (
        <FeatureModal 
          feature={modalFeature} 
          onClose={() => setModalFeature(null)} 
        />
      )}
      
      <Footer/>
    </div>
  );
};

export default FeaturesPage;