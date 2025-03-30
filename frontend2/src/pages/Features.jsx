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
  
const FeatureItem = ({ feature, index, openModal }) => {
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
        {/* Interactive Feature Showcase - REPLACING ONLY THE IMAGE/VIDEO SECTION */}
        <motion.div 
          className="w-full md:w-1/2 relative overflow-hidden rounded-xl border border-gray-700 shadow-2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />
          
          {/* Feature-specific interactive content */}
          <div className="relative z-10 w-full h-full min-h-[300px] p-4 flex items-center justify-center bg-gray-900 bg-opacity-95">
            {feature.id === 1 && <ListingWizardDemo colorClass={feature.color} />}
            {feature.id === 2 && <BundleBuilderDemo colorClass={feature.color} />}
            {feature.id === 3 && <ProductGeniusDemo colorClass={feature.color} />}
            {feature.id === 4 && <PricePilotDemo colorClass={feature.color} />}
            {feature.id === 5 && <InstantStudioDemo colorClass={feature.color} />}
            {feature.id === 6 && <TrendSpotDemo colorClass={feature.color} />}
            {feature.id === 7 && <AdCrafterDemo colorClass={feature.color} />}
          </div>
        </motion.div>

        {/* Text content - PRESERVING ALL ORIGINAL FEATURE TEXT CONTENT */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
              <span className="text-white">{feature.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
          </div>
          
          <p className="text-gray-300 leading-relaxed">
            {feature.description}
          </p>
          
          <div>
            <h4 className="font-bold text-lg text-white mb-2">Why it matters</h4>
            <p className="text-gray-400">
              {feature.why}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg text-white mb-2">Key capabilities</h4>
            <ul className="space-y-2">
              {feature.capabilities.map((capability, idx) => (
                <li key={idx} className="flex items-start">
                  <div className={`mt-1 mr-2 text-${feature.color.split('-')[1]}-500`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM7 11.4L3.6 8L5 6.6L7 8.6L11 4.6L12.4 6L7 11.4Z" 
                        fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="text-gray-300">{capability}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4">
            <p className="text-gray-400 mb-3">{feature.cta}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white bg-gradient-to-r ${feature.color} shadow-lg`}
              onClick={openModal}
            >
              Learn More
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Common UI components for demos
const DemoCard = ({ title, children, className = "" }) => (
  <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-gray-800 bg-gray-900 shadow-lg">
    <div className="py-2 px-3 bg-gray-800 border-b border-gray-700 flex items-center">
      <div className="flex space-x-1.5 mr-3">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
      </div>
      <div className="text-sm text-gray-300 font-medium flex-1 text-center">{title}</div>
    </div>
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  </div>
);

const Button = ({ children, variant = "primary", className = "", onClick, disabled = false }) => {
  const baseClasses = "text-sm font-medium rounded-md py-1.5 px-3 transition duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Interactive Demo Components
const ListingWizardDemo = ({ colorClass }) => {
  const [demoText, setDemoText] = useState("Smart Bamboo Cutting Board with Juice Groove");
  const [generating, setGenerating] = useState(false);
  const [seoScore, setSeoScore] = useState(76);
  
  const placeholderTexts = [
    "Premium Stainless Steel Vegetable Chopper with 5 Interchangeable Blades",
    "Ergonomic Silicone Kitchen Utensil Set - Heat Resistant & Dishwasher Safe",
    "Ultra-Soft Egyptian Cotton Towel Set - Quick Dry & Luxurious Feel",
    "Adjustable Laptop Stand with Cooling Fan - Compatible with All Devices"
  ];
  
  const handleGenerate = () => {
    if (generating) return;
    
    setGenerating(true);
    // Pick a random text different from current
    let newText;
    do {
      newText = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
    } while (newText === demoText);
    
    // Clear current text
    setDemoText("");
    
    // Type new text character by character
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= newText.length) {
        setDemoText(newText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setGenerating(false);
        setSeoScore(Math.floor(Math.random() * 15) + 75); // Random score between 75-90
      }
    }, 30);
  };
  
  return (
    <DemoCard title="Listing Wizard AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Product Title</label>
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3 min-h-[60px] text-gray-100">
            {demoText}
            {generating && (
              <motion.span 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-4 ml-0.5 bg-purple-500"
              />
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs text-gray-400">SEO Score</label>
            <span className={`text-xs font-medium ${
              seoScore >= 85 ? 'text-green-400' : 
              seoScore >= 75 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>{seoScore}/100</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${
                seoScore >= 85 ? 'bg-green-500' : 
                seoScore >= 75 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              animate={{ width: `${seoScore}%` }}
              initial={{ width: "0%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center py-1.5 px-2 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">Keywords</div>
            <div className="text-center py-1.5 px-2 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">Description</div>
            <div className="text-center py-1.5 px-2 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">Features</div>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            className="w-full"
          >
            {generating ? "Generating..." : "Generate New Title"}
          </Button>
        </div>
      </div>
    </DemoCard>
  );
};

const BundleBuilderDemo = ({ colorClass }) => {
  const [products, setProducts] = useState([
    { id: 1, name: "Coffee Maker", price: 89.99, selected: true },
    { id: 2, name: "Coffee Grinder", price: 49.99, selected: false },
    { id: 3, name: "Milk Frother", price: 29.99, selected: false },
    { id: 4, name: "Coffee Cups Set", price: 19.99, selected: false }
  ]);
  
  const [bundleScore, setBundleScore] = useState(68);
  const [analyzing, setAnalyzing] = useState(false);
  
  const selectedCount = products.filter(p => p.selected).length;
  const totalPrice = products
    .filter(p => p.selected)
    .reduce((sum, product) => sum + product.price, 0)
    .toFixed(2);
  
  const toggleProduct = (id) => {
    if (analyzing) return;
    
    setProducts(products.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
    
    // Simulate AI analyzing the bundle
    setAnalyzing(true);
    setTimeout(() => {
      const selectedCount = products.filter(p => 
        p.id === id ? !p.selected : p.selected
      ).length;
      
      // Calculate a realistic bundle score based on selection
      let newScore;
      if (selectedCount === 1) {
        newScore = 50;
      } else if (selectedCount === 2) {
        newScore = 75;
      } else if (selectedCount === 3) {
        newScore = 89;
      } else if (selectedCount === 4) {
        newScore = 94;
      } else {
        newScore = 0;
      }
      
      setBundleScore(newScore);
      setAnalyzing(false);
    }, 600);
  };
  
  return (
    <DemoCard title="Bundle Builder AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs text-gray-400">Bundle Items</label>
            <span className="text-xs text-gray-400">{selectedCount} selected</span>
          </div>
          
          <div className="space-y-2">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                  product.selected 
                    ? 'bg-purple-900 bg-opacity-30 border-purple-600' 
                    : 'bg-gray-800 border-gray-700'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-2 border ${
                    product.selected 
                      ? 'bg-purple-600 border-purple-400' 
                      : 'bg-gray-700 border-gray-600'
                  }`}>
                    {product.selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-200">{product.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-300">${product.price}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-end">
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Bundle Total:</span>
              <span className="text-sm font-bold text-white">${totalPrice}</span>
            </div>
            
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Bundle Score:</span>
              <span className={`text-xs font-medium ${
                bundleScore >= 85 ? 'text-green-400' : 
                bundleScore >= 70 ? 'text-yellow-400' : 
                'text-orange-400'
              }`}>{bundleScore}/100</span>
            </div>
            
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${
                  bundleScore >= 85 ? 'bg-green-500' : 
                  bundleScore >= 70 ? 'bg-yellow-500' : 
                  'bg-orange-500'
                }`}
                initial={{ width: "0%" }}
                animate={{ width: `${bundleScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {analyzing && (
              <div className="mt-2 flex justify-center">
                <motion.div 
                  className="text-xs text-purple-400 font-medium flex items-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing bundle effectiveness
                </motion.div>
              </div>
            )}
          </div>
          
          <Button 
            variant={bundleScore >= 85 ? "success" : "primary"}
            className="w-full"
            disabled={selectedCount === 0}
          >
            {bundleScore >= 85 ? "Apply Optimal Bundle" : "Optimize Bundle"}
          </Button>
        </div>
      </div>
    </DemoCard>
  );
};

const ProductGeniusDemo = ({ colorClass }) => {
  const [messages, setMessages] = useState([
    { text: "How can I help with your product?", isUser: false }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const questions = [
    "How can I improve conversion rates?",
    "What keywords should I target?",
    "Compare to competitor products",
    "Suggest better pricing"
  ];

  const responses = [
    "Based on market analysis, adding more lifestyle photos and highlighting the eco-friendly materials could increase conversions by 24%. Also consider adding a video demonstration and customer testimonials.",
    "Top keywords to target: 'sustainable kitchenware', 'eco-friendly cooking tools', 'premium kitchen accessories'. Adding these could improve search visibility by 40% according to our competitive analysis.",
    "Your product has better durability ratings but competitors offer more color options and lower price points. Consider adding variety to match their market penetration or emphasize your quality advantage.",
    "Market analysis suggests $34.99 would be the optimal price point - 15% higher conversion expected compared to current pricing. This balances perceived value with competitive positioning."
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleQuestion = () => {
    if (typing) return;
    
    const question = questions[currentQuestion];
    setMessages([...messages, { text: question, isUser: true }]);
    setTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      let response = responses[currentQuestion];
      let currentText = "";
      let charIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (charIndex < response.length) {
          currentText += response[charIndex];
          setMessages([
            ...messages,
            { text: question, isUser: true },
            { text: currentText, isUser: false }
          ]);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTyping(false);
          setCurrentQuestion((currentQuestion + 1) % questions.length);
        }
      }, 15);
    }, 800);
  };

  return (
    <DemoCard title="Product Genius AI">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-lg p-2.5 text-sm ${
                message.isUser 
                  ? 'ml-auto bg-purple-600 text-white' 
                  : 'mr-auto bg-gray-800 border border-gray-700 text-gray-200'
              }`}
            >
              {message.text}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center">
            <Button
              onClick={handleQuestion}
              disabled={typing}
              className="w-full"
            >
              {typing ? (
                <span className="flex items-center justify-center">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full mr-1"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full mr-1"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
                  />
                </span>
              ) : (
                `Ask About ${questions[currentQuestion].split('?')[0]}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </DemoCard>
  );
};

const PricePilotDemo = ({ colorClass }) => {
  const [price, setPrice] = useState(49.99);
  const [profit, setProfit] = useState(14.50);
  const [rank, setRank] = useState(12);
  const [conversionRate, setConversionRate] = useState(3.2);
  const [isOptimal, setIsOptimal] = useState(false);
  
  const updateMetrics = (newPrice) => {
    setPrice(newPrice);
    
    // Simulate AI analytics based on price changes
    if (newPrice < 40) {
      setProfit((newPrice * 0.2).toFixed(2));
      setRank(Math.floor(30 - newPrice/2));
      setConversionRate((2 + (newPrice - 30) / 10).toFixed(1));
      setIsOptimal(false);
    } else if (newPrice < 45) {
      setProfit((newPrice * 0.25).toFixed(2));
      setRank(Math.floor(20 - newPrice/5));
      setConversionRate((3 + (newPrice - 40) / 10).toFixed(1));
      setIsOptimal(false);
    } else if (newPrice >= 45 && newPrice <= 55) {
      setProfit((newPrice * 0.3).toFixed(2));
      setRank(Math.floor(10 + (50 - newPrice)/5));
      setConversionRate((4 + (50 - Math.abs(50 - newPrice)) / 10).toFixed(1));
      setIsOptimal(true);
    } else if (newPrice < 60) {
      setProfit((newPrice * 0.25).toFixed(2));
      setRank(Math.floor(10 + newPrice/10));
      setConversionRate((3 + (60 - newPrice) / 10).toFixed(1));
      setIsOptimal(false);
    } else {
      setProfit((newPrice * 0.2).toFixed(2));
      setRank(Math.floor(15 + newPrice/5));
      setConversionRate((2 + (70 - newPrice) / 10).toFixed(1));
      setIsOptimal(false);
    }
  };
  
  return (
    <DemoCard title="Price Optimization AI">
      <div className="p-4 flex flex-col h-full">
        <div className="text-center mb-5">
          <motion.div 
            key={price}
            className="text-4xl font-bold text-white"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            ${price.toFixed(2)}
          </motion.div>
          <div className="text-xs text-gray-400 mt-1">Drag slider to optimize pricing</div>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
            <span>$29.99</span>
            <span>$49.99</span>
            <span>$69.99</span>
          </div>
          <input 
            type="range" 
            min="29.99" 
            max="69.99" 
            step="0.01" 
            value={price} 
            onChange={(e) => updateMetrics(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="relative mt-1">
            <div 
              className="absolute w-1 h-3 bg-green-500 rounded-full"
              style={{ left: `calc(${((50 - 29.99) / (69.99 - 29.99)) * 100}% - 2px)` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3">
            <div className="text-xs text-gray-400 mb-1">Profit/Unit</div>
            <motion.div 
              key={profit}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold text-green-400"
            >
              ${profit}
            </motion.div>
          </div>
          
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3">
            <div className="text-xs text-gray-400 mb-1">Market Rank</div>
            <motion.div 
              key={rank}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold text-blue-400"
            >
              #{rank}
            </motion.div>
          </div>
          
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3">
            <div className="text-xs text-gray-400 mb-1">Conversion Rate</div>
            <motion.div 
              key={conversionRate}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold text-yellow-400"
            >
              {conversionRate}%
            </motion.div>
          </div>
          
          <div className="bg-gray-800 rounded-md border border-gray-700 p-3">
            <div className="text-xs text-gray-400 mb-1">AI Recommendation</div>
            <motion.div 
              key={String(isOptimal)}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1, color: isOptimal ? "#4ade80" : "#f87171" }}
              className="text-lg font-bold flex items-center"
            >
              {isOptimal ? (
                <>
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Optimal
                </>
              ) : (
                "Adjust"
              )}
            </motion.div>
          </div>
        </div>
        
        <Button 
          variant={isOptimal ? "success" : "primary"}
          className="w-full"
        >
          {isOptimal ? "Apply Optimal Price" : "Find Optimal Price"}
        </Button>
      </div>
    </DemoCard>
  );
};

const InstantStudioDemo = ({ colorClass }) => {
  const [currentEffect, setCurrentEffect] = useState("original");
  const [bgRemoved, setBgRemoved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [productView, setProductView] = useState("front");
  
  // More realistic product images using SVG
  const products = {
    headphones: {
      front: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="headphoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#4a4a4a" />
            </linearGradient>
          </defs>
          <path d="M50,20 C30,20 20,35 20,55 L20,65 C20,68 22,70 25,70 L30,70 C33,70 35,68 35,65 L35,60 C35,57 33,55 30,55 L25,55 L25,55 C25,40 35,25 50,25 C65,25 75,40 75,55 L70,55 C67,55 65,57 65,60 L65,65 C65,68 67,70 70,70 L75,70 C78,70 80,68 80,65 L80,55 C80,35 70,20 50,20 Z" fill="url(#headphoneGradient)" />
          <circle cx="30" cy="62.5" r="7.5" fill="#ff5e5e" />
          <circle cx="70" cy="62.5" r="7.5" fill="#ff5e5e" />
        </svg>
      ),
      side: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="headphoneGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#4a4a4a" />
            </linearGradient>
          </defs>
          <path d="M50,25 C35,25 25,35 25,50 L25,60 C25,63 27,65 30,65 L35,65 C38,65 40,63 40,60 L40,55 C40,52 38,50 35,50 L30,50 L30,50 C30,40 40,30 50,30 L50,30 L50,30 L50,30 L50,25 Z" fill="url(#headphoneGradient2)" />
          <circle cx="35" cy="57.5" r="7.5" fill="#ff5e5e" />
          <path d="M30,35 L70,35 C75,35 80,40 80,45 L80,65 C80,70 75,75 70,75 L65,75 L65,50 C65,45 60,40 55,40 L45,40 C40,40 35,45 35,50 L35,75 L30,75 C25,75 20,70 20,65 L20,45 C20,40 25,35 30,35 Z" fill="#333" opacity="0.5" />
        </svg>
      )
    }
  };
  
  // More realistic effects with actual visual differences
  const effects = {
    original: { filter: "none", transform: "scale(1)" },
    enhance: { filter: "brightness(1.3) contrast(1.2) saturate(1.3)", transform: "scale(1)" },
    dramatic: { filter: "contrast(1.5) saturate(1.8) hue-rotate(5deg)", transform: "scale(1)" },
    studio: { filter: "brightness(1.15) contrast(1.1) saturate(0.85) sepia(0.15)", transform: "scale(1)" },
    vintage: { filter: "sepia(0.35) contrast(1.1) brightness(0.9) hue-rotate(350deg)", transform: "scale(1)" },
  };
  
  const backgrounds = {
    studio: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
    gradient: "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
    minimal: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    none: "transparent"
  };
  
  const [background, setBackground] = useState("studio");
  
  const handleEffectChange = (effect) => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      setCurrentEffect(effect);
      setProcessing(false);
    }, 400);
  };
  
  const handleBgRemove = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      setBgRemoved(!bgRemoved);
      setBackground(bgRemoved ? "studio" : "none");
      setProcessing(false);
    }, 600);
  };
  
  const toggleProductView = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      setProductView(productView === "front" ? "side" : "front");
      setProcessing(false);
    }, 300);
  };
  
  const changeBackground = (bg) => {
    if (processing || bgRemoved) return;
    setProcessing(true);
    setTimeout(() => {
      setBackground(bg);
      setProcessing(false);
    }, 300);
  };
  
  // Checkerboard background pattern for transparency
  const transparentBg = "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNDI0MjQyIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM0MjQyNDIiLz48cmVjdCB4PSIxMCIgeT0iMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzUzNTM1Ii8+PHJlY3QgeD0iMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzM1MzUzNSIvPjwvc3ZnPg==')";
  
  return (
    <DemoCard title="Image Enhancer Studio">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3 flex justify-center">
          <div 
            className="relative w-40 h-40 overflow-hidden rounded-md border border-gray-700 flex items-center justify-center"
            style={{ background: bgRemoved ? transparentBg : backgrounds[background] }}
          >
            {processing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-20">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <>
                {/* Product image with applied effect */}
                <motion.div 
                  className="relative z-10 w-32 h-32 flex items-center justify-center"
                  style={{ 
                    filter: effects[currentEffect].filter,
                    transform: effects[currentEffect].transform
                  }}
                >
                  <div className="w-full h-full transition-opacity duration-300" style={{ opacity: bgRemoved ? 1 : 0.9 }}>
                    {products.headphones[productView]}
                  </div>
                </motion.div>
                
                {/* Photo controls */}
                <motion.div 
                  className="absolute bottom-1 right-1 z-20 flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <button 
                    onClick={toggleProductView}
                    className="bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
        
        {/* Rest of component remains the same */}
        {/* Effect controls */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1.5">Enhancement Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.keys(effects).map((effect) => (
              <Button 
                key={effect}
                variant={currentEffect === effect ? "primary" : "secondary"}
                onClick={() => handleEffectChange(effect)}
                disabled={processing}
                className="py-1 text-xs"
              >
                {effect.charAt(0).toUpperCase() + effect.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Background controls (only visible when bg not removed) */}
        {!bgRemoved && (
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1.5">Background</label>
            <div className="flex space-x-2">
              {Object.keys(backgrounds).filter(bg => bg !== 'none').map((bg) => (
                <button
                  key={bg}
                  onClick={() => changeBackground(bg)}
                  disabled={processing}
                  className={`w-8 h-8 rounded-full border-2 ${background === bg ? 'border-purple-500' : 'border-transparent'}`}
                  style={{ background: backgrounds[bg] }}
                ></button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 flex flex-col justify-end">
          <Button
            onClick={handleBgRemove}
            disabled={processing}
            variant={bgRemoved ? "success" : "secondary"}
            className="w-full mb-3"
          >
            {bgRemoved ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Background Removed
              </span>
            ) : (
              "Remove Background"
            )}
          </Button>
          
          <Button className="w-full" variant="primary">
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Image
            </span>
          </Button>
        </div>
      </div>
    </DemoCard>
  );
};

const TrendSpotDemo = ({ colorClass }) => {
  // More realistic product sales data with seasonal trends
  const initialData = {
    "Sales Volume": [42, 45, 40, 38, 45, 52, 60, 65, 58, 72, 85],
    "Search Traffic": [55, 52, 48, 50, 62, 58, 65, 70, 78, 85, 92], 
    "Competitor Prices": [68, 65, 67, 70, 72, 69, 65, 62, 58, 55, 50]
  };
  
  const [chartData, setChartData] = useState(initialData["Sales Volume"]);
  const [selectedTrend, setSelectedTrend] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState({
    change: "+24%",
    status: "Growing",
    prediction: "Upward trend likely to continue",
    recommendation: "Increase inventory by 15%"
  });
  
  const trends = ["Sales Volume", "Search Traffic", "Competitor Prices"];
  
  // Realistic insights based on trend data
  const trendInsights = {
    "Sales Volume": {
      change: "+24%",
      status: "Growing",
      prediction: "Upward trend likely to continue",
      recommendation: "Increase inventory by 15%"
    },
    "Search Traffic": {
      change: "+32%",
      status: "Accelerating",
      prediction: "Seasonal peak approaching",
      recommendation: "Invest in additional advertising"
    },
    "Competitor Prices": {
      change: "-12%",
      status: "Declining",
      prediction: "Competitors offering discounts",
      recommendation: "Consider strategic price matching"
    }
  };
  
  const handleTrendChange = (index) => {
    if (analyzing) return;
    
    setAnalyzing(true);
    setTimeout(() => {
      const selectedTrendName = trends[index];
      setSelectedTrend(index);
      setChartData(initialData[selectedTrendName]);
      setInsights(trendInsights[selectedTrendName]);
      setAnalyzing(false);
    }, 800);
  };
  
  // Calculate month labels (past 10 months + current)
  const getMonthLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const month = new Date(now);
      month.setMonth(now.getMonth() - i);
      labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  };
  
  const monthLabels = getMonthLabels();
  
  // Generate unique IDs for SVG elements to avoid conflicts
  const lineGradientId = `lineGradient-${selectedTrend}`;
  const areaGradientId = `areaGradient-${selectedTrend}`;
  
  // Simple bar chart implementation
  const renderBarChart = () => {
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    
    return (
      <div className="w-full h-full flex items-end space-x-1 pt-5 pb-2">
        {chartData.map((value, i) => {
          const height = ((value - minValue) / (maxValue - minValue)) * 100;
          const isGrowing = i > 0 && value > chartData[i-1];
          const color = isGrowing ? "bg-green-500" : "bg-purple-500";
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${color} rounded-t transition-all duration-500 ease-out`} 
                style={{ height: `${height}%` }}
              ></div>
              {i % 2 === 0 && (
                <div className="text-[7px] text-gray-500 mt-1 truncate">
                  {monthLabels[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Line chart implementation
  const renderLineChart = () => {
    // Calculate normalized points
    const points = chartData.map((value, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = ((Math.max(...chartData) - value) / (Math.max(...chartData) - Math.min(...chartData))) * 80;
      return [x, y];
    });
    
    // Generate SVG path
    const linePath = `M${points.map(p => `${p[0]},${p[1]}`).join(' L')}`;
    const areaPath = `${linePath} L100,100 L0,100 Z`;
    
    return (
      <div className="w-full h-full relative">
        {/* Month indicators */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between px-1 text-[7px] text-gray-500">
          {monthLabels.filter((_, i) => i % 2 === 0).map((month, i) => (
            <div key={i} className="truncate">{month}</div>
          ))}
        </div>
        
        {/* Chart */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={lineGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area under the line */}
          <path
            d={areaPath}
            fill={`url(#${areaGradientId})`}
            opacity={analyzing ? 0.2 : 1}
            className="transition-opacity duration-300"
          />
          
          {/* The line itself */}
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${lineGradientId})`}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={analyzing ? 0.2 : 1}
            className="transition-opacity duration-300"
          />
          
          {/* Data points */}
          {points.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#8B5CF6"
              opacity={analyzing ? 0.2 : 1}
              className="transition-opacity duration-300"
            />
          ))}
        </svg>
      </div>
    );
  };
  
  return (
    <DemoCard title="Market Trends AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3 flex justify-between items-center">
          <div className="text-xs font-medium text-gray-300">{trends[selectedTrend]} Analytics</div>
          
          {analyzing ? (
            <div className="text-xs text-purple-400 flex items-center">
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing market data
            </div>
          ) : (
            <div className={`text-xs ${insights.change.startsWith('+') ? 'text-green-400' : 'text-red-400'} flex items-center font-medium`}>
              <svg className={`w-3 h-3 mr-1 ${insights.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d={insights.change.startsWith('+') 
                  ? "M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  : "M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"} 
                  clipRule="evenodd"></path>
              </svg>
              {insights.change} in {trends[selectedTrend].toLowerCase()}
            </div>
          )}
        </div>
        
        {/* Insight pills */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-800 bg-opacity-70 rounded-md p-1.5 border border-gray-700">
            <div className="text-[9px] uppercase text-gray-500 tracking-wider">Status</div>
            <div className="text-xs font-medium text-white">{insights.status}</div>
          </div>
          <div className="bg-gray-800 bg-opacity-70 rounded-md p-1.5 border border-gray-700">
            <div className="text-[9px] uppercase text-gray-500 tracking-wider">Prediction</div>
            <div className="text-xs font-medium text-white truncate">{insights.prediction}</div>
          </div>
        </div>
        
        {/* Chart area - simplified and more reliable */}
        <div className="relative h-32 mb-2 bg-gray-800 bg-opacity-30 rounded-md p-2 border border-gray-700">
          {/* Grid lines */}
          <div className="absolute inset-2 grid grid-rows-4 gap-y-6 pointer-events-none">
            {[0, 1, 2, 3].map((_, i) => (
              <div key={i} className="w-full border-t border-gray-700 opacity-40" />
            ))}
          </div>
          
          {/* Render the line chart */}
          {renderLineChart()}
        </div>
        
        {/* AI Recommendation */}
        <div className="mb-3 bg-purple-900 bg-opacity-20 p-2 rounded-md border border-purple-800">
          <div className="flex items-center mb-1">
            <svg className="w-3 h-3 text-purple-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            <div className="text-[9px] uppercase text-purple-400 font-medium tracking-wider">AI Recommendation</div>
          </div>
          <div className="text-xs text-white">{insights.recommendation}</div>
        </div>
        
        {/* Trend selector */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-3 gap-2">
            {trends.map((trend, i) => (
              <Button
                key={i}
                variant={selectedTrend === i ? "primary" : "secondary"}
                onClick={() => handleTrendChange(i)}
                disabled={analyzing}
                className="text-xs py-1.5"
              >
                {trend}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DemoCard>
  );
};

const AdCrafterDemo = ({ colorClass }) => {
  const adTemplates = ["Social Post", "Banner Ad", "Product Ad"];
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  const handleTemplateChange = (index) => {
    if (generating) return;
    setSelectedTemplate(index);
    setGenerated(false);
  };
  
  const handleGenerate = () => {
    if (generating) return;
    
    setGenerating(true);
    setGenerated(false);
    
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1800);
  };
  
  const renderAdContent = () => {
    if (generating) {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-3"
          />
          <div className="text-xs text-gray-400">Generating {adTemplates[selectedTemplate]}...</div>
        </div>
      );
    }
    
    if (!generated) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-50">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-xs text-gray-500">Click Generate to create ad content</div>
        </div>
      );
    }
    
    // Different ad templates
    if (selectedTemplate === 0) { // Social Post
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full p-2 flex flex-col"
        >
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 mr-2"></div>
            <div className="text-xs font-medium text-white">Your Brand</div>
          </div>
          <div className="text-xs text-gray-300 mb-2">
            Introducing our revolutionary product that solves your biggest problems! 
            🚀 Award-winning design meets cutting-edge technology.
          </div>
          <div className="flex-1 bg-gray-700 rounded-md mb-2 flex items-center justify-center">
            <div className="text-xs text-gray-500 text-center">Ad Image Generated</div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <div>♥ 1.2K Likes</div>
            <div>↺ 342 Shares</div>
            <div>✓ High Engagement</div>
          </div>
        </motion.div>
      );
    } else if (selectedTemplate === 1) { // Banner Ad
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full p-2 flex flex-col"
        >
          <div className="flex-1 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-md p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-xs font-bold text-white mb-1">SUMMER SALE</div>
              <div className="text-xs text-gray-300 mb-2">Up to 50% off</div>
              <div className="bg-white text-purple-900 text-[10px] font-bold rounded py-1 px-2 inline-block">
                SHOP NOW
              </div>
            </div>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded"></div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <div>CTR: 3.8%</div>
            <div>Conversions: High</div>
            <div>✓ Optimized</div>
          </div>
        </motion.div>
      );
    } else { // Product Ad
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full p-2 flex flex-col"
        >
          <div className="flex-1 bg-gray-800 rounded-md p-3">
            <div className="h-1/2 bg-gray-700 rounded-md mb-2 flex items-center justify-center">
              <div className="text-xs text-gray-500">Product Image</div>
            </div>
            <div className="text-xs font-medium text-white mb-1">Premium Ultra-Durable Product</div>
            <div className="text-[10px] text-gray-400 mb-2">Exclusive features that revolutionize your experience</div>
            <div className="flex justify-between items-center">
              <div className="text-xs font-bold text-green-400">$59.99</div>
              <div className="bg-purple-600 text-white text-[10px] rounded py-0.5 px-2">
                BUY NOW
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <div>★★★★★</div>
            <div>Engagement: 4.7/5</div>
            <div>✓ Best Seller</div>
          </div>
        </motion.div>
      );
    }
  };
  
  return (
    <DemoCard title="Ad Creator AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-2">Ad Template</label>
          <div className="grid grid-cols-3 gap-2">
            {adTemplates.map((template, i) => (
              <Button
                key={i}
                variant={selectedTemplate === i ? "primary" : "secondary"}
                onClick={() => handleTemplateChange(i)}
                disabled={generating}
              >
                {template}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="border border-gray-700 rounded-md overflow-hidden mb-4 h-40 bg-gray-800">
          {renderAdContent()}
        </div>
        
        <div className="flex-1 flex flex-col justify-end">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
          >
            {generating ? "Generating..." : "Generate Ad Content"}
          </Button>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <div>Targeted</div>
            <div>Optimized Copy</div>
            <div>AI-Enhanced</div>
          </div>
        </div>
      </div>
    </DemoCard>
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

  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Function to open modal with selected feature
  const openFeatureModal = (feature) => {
    setSelectedFeature(feature);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };
  
  // Function to close modal
  const closeFeatureModal = () => {
    setSelectedFeature(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
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
          <FeatureItem 
            key={feature.id} 
            feature={feature} 
            index={index} 
            openModal={() => openFeatureModal(feature)}
          />
        ))}
      </motion.div>
      
      {/* Modal Portal */}
      {selectedFeature && (
        <FeatureModal 
          feature={selectedFeature} 
          onClose={closeFeatureModal} 
        />
      )}
      
      <Footer/>
    </div>
  );
};

export default FeaturesPage;