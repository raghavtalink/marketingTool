import React, { useState, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const FeaturesPage = () => {
  // State for active feature
  const [activeFeature, setActiveFeature] = useState(null);
  
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
      title: "Smart Automation",
      description: "Our AI-powered automation learns your preferences over time, making your workflow smoother and more efficient.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-purple-500 to-indigo-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Cross-Platform Sync",
      description: "Seamlessly sync your data across all your devices with real-time updates and conflict resolution.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-blue-500 to-cyan-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Advanced Analytics",
      description: "Gain deep insights with our comprehensive analytics dashboard, featuring customizable reports and visualizations.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-emerald-500 to-teal-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Collaborative Workspace",
      description: "Work together in real-time with your team members, with intuitive sharing and permission controls.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-amber-500 to-orange-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 5,
      title: "Enterprise-Grade Security",
      description: "Rest easy knowing your data is protected with end-to-end encryption and compliance with industry standards.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-red-500 to-rose-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 6,
      title: "Custom Integration",
      description: "Connect with your favorite tools and services through our extensive API and integration marketplace.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-violet-500 to-purple-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    },
    {
      id: 7,
      title: "24/7 Premium Support",
      description: "Get help whenever you need it with our dedicated support team, available around the clock.",
      videoUrl: "/api/placeholder/320/180",
      color: "from-pink-500 to-fuchsia-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
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
    </div>
  );
};

export default FeaturesPage;