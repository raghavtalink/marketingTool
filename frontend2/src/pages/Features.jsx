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
      setProcessing(false);
    }, 600);
  };
  
  const effects = {
    original: { filter: "none", transform: "scale(1)" },
    enhance: { filter: "brightness(1.2) contrast(1.1) saturate(1.2)", transform: "scale(1)" },
    dramatic: { filter: "contrast(1.4) saturate(1.5) hue-rotate(5deg)", transform: "scale(1)" },
    studio: { filter: "brightness(1.1) contrast(1.05) saturate(0.9)", transform: "scale(1)" },
    zoom: { filter: "none", transform: "scale(1.1)" },
  };
  
  return (
    <DemoCard title="Image Enhancer AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-4 flex justify-center">
          <div className="relative w-40 h-40 overflow-hidden rounded-md border border-gray-700 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            {processing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <>
                {!bgRemoved && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800" />
                )}
                <motion.div 
                  animate={effects[currentEffect]}
                  className="relative z-10 w-24 h-28 rounded-md"
                  style={{ 
                    background: 'linear-gradient(135deg, #e6e6e6 0%, #d9d9d9 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="absolute left-2 right-2 top-2 h-12 rounded bg-gray-300"></div>
                  <div className="absolute left-2 right-2 bottom-6 h-6 rounded bg-gray-400"></div>
                  <div className="absolute bottom-2 left-4 right-4 h-2 rounded bg-gray-500"></div>
                </motion.div>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Enhancement Style</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(effects).map((effect) => (
              <Button 
                key={effect}
                variant={currentEffect === effect ? "primary" : "secondary"}
                onClick={() => handleEffectChange(effect)}
                disabled={processing}
                className="py-1"
              >
                {effect.charAt(0).toUpperCase() + effect.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
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
          
          <Button className="w-full">Export Enhanced Image</Button>
        </div>
      </div>
    </DemoCard>
  );
};

const TrendSpotDemo = ({ colorClass }) => {
  const [chartData, setChartData] = useState([65, 70, 55, 60, 75, 68, 82, 75, 78, 88, 92]);
  const [selectedTrend, setSelectedTrend] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const trends = ["Sales Volume", "Search Traffic", "Competitor Prices"];
  
  const handleTrendChange = (index) => {
    if (analyzing) return;
    
    setAnalyzing(true);
    setTimeout(() => {
      setSelectedTrend(index);
      // Generate new random data for the chart
      const newData = Array.from({ length: 11 }, (_, i) => {
        const baseValue = 50 + Math.random() * 45;
        // Make the trend go upward toward the end
        return Math.round(baseValue + (i / 10) * 20);
      });
      setChartData(newData);
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
  
  return (
    <DemoCard title="Market Trends AI">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3 flex justify-between items-center">
          <div className="text-xs text-gray-400">Trend Analysis - {trends[selectedTrend]}</div>
          
          {analyzing ? (
            <div className="text-xs text-purple-400 flex items-center">
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </div>
          ) : (
            <div className="text-xs text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
              </svg>
              +24% growth 
            </div>
          )}
        </div>
        
        <div className="relative h-36 mb-3 flex items-end space-x-0.5">
          {/* Chart grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-t border-gray-800 w-full h-0" />
            ))}
          </div>
          
          {/* Value axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-between items-end pr-1 text-[9px] text-gray-500">
            <div>100</div>
            <div>75</div>
            <div>50</div>
            <div>25</div>
            <div>0</div>
          </div>
          
          {/* Chart bars */}
          <div className="ml-5 flex-1 flex items-end space-x-0.5">
            {chartData.map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                className={`flex-1 rounded-t ${
                  analyzing ? "bg-gray-700" : "bg-gradient-to-t from-purple-900 to-purple-500"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Month labels */}
        <div className="flex justify-between px-5 mb-4 text-[9px] text-gray-500 overflow-hidden">
          {monthLabels.map((month, i) => (
            <div key={i}>{month}</div>
          ))}
        </div>
        
        <div className="flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-3 gap-2">
            {trends.map((trend, i) => (
              <Button
                key={i}
                variant={selectedTrend === i ? "primary" : "secondary"}
                onClick={() => handleTrendChange(i)}
                disabled={analyzing}
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