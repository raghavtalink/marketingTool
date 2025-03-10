  import React, { useEffect } from 'react';
  import { useNavigate } from "react-router-dom";
  import { motion, useAnimation, useInView } from 'framer-motion';

  const BentoGrid = () => {
    // Animation variants for container
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    };

    // Animation variants for cards
    const cardVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: "spring", 
          stiffness: 100,
          damping: 12
        }
      },
      hover: {
        scale: 1.05,
        borderColor: "var(--highlight-color)",
        boxShadow: "var(--glow-effect)",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }
    };

    // Animation variants for the icons
    const iconVariants = {
      initial: { scale: 1 },
      hover: { 
        scale: 1.2,
        rotate: 5,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }
      }
    };

    // Animation variants for header text
    const headerVariants = {
      hidden: { opacity: 0, y: -30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.8,
          ease: "easeOut"
        }
      }
    };

    // Scroll-triggered animation for header section
    const HeaderSection = () => {
      const controls = useAnimation();
      const ref = React.useRef(null);
      const inView = useInView(ref, { once: true, amount: 0.3 });
      
      useEffect(() => {
        if (inView) {
          controls.start("visible");
        }
      }, [controls, inView]);
      
      return (
        <motion.div 
          ref={ref}
          className="max-w-5xl mx-auto mb-12"
          initial="hidden"
          animate={controls}
          variants={headerVariants}
        >
          <motion.h1 
            className="text-5xl font-bold mb-4"
            variants={{
              hidden: { opacity: 0, y: -30 },
              visible: { 
                opacity: 1, 
                y: 0, 
                transition: { duration: 0.6 } 
              }
            }}
          >
            Sell Smarter, Grow Faster
          </motion.h1>
          <motion.p 
            className="text-2xl text-gray-400"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { delay: 0.2, duration: 0.8 } 
              }
            }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { repeat: Infinity, repeatType: "reverse", duration: 5 }
              }}
            >
              Sell smarter
            </motion.span>{" "}
            with AI-powered tools.{" "}
            <motion.span 
              className="inline-block bg-gradient-to-r from-green-400 to-teal-500 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { repeat: Infinity, repeatType: "reverse", duration: 5, delay: 0.5 }
              }}
            >
              Optimize listings,
            </motion.span>{" "}
            boost sales, and{" "}
            <motion.span 
              className="inline-block bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { repeat: Infinity, repeatType: "reverse", duration: 5, delay: 1 }
              }}
            >
              dominate your niche
            </motion.span>
            —whether you're selling{" "}
            <motion.span 
              className="inline-block bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { repeat: Infinity, repeatType: "reverse", duration: 5, delay: 1.5 }
              }}
            >
              online or in-person,
            </motion.span>{" "}
            locally or globally,{" "}
            <motion.span 
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { repeat: Infinity, repeatType: "reverse", duration: 5, delay: 2 }
              }}
            >
              direct or wholesale,
            </motion.span>{" "}
            on desktop or mobile.
          </motion.p>
        </motion.div>
      );
    };

    // Scroll-triggered animation for the grid
    const GridSection = () => {
      const controls = useAnimation();
      const ref = React.useRef(null);
      const inView = useInView(ref, { once: true, amount: 0.1 });
      const navigate = useNavigate();
      
      useEffect(() => {
        if (inView) {
          controls.start("visible");
        }
      }, [controls, inView]);
      
      return (
        <motion.div 
          ref={ref}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Card 1 */}
          <motion.div 
            className="bg-black rounded-xl p-6 border border-gray-800 relative overflow-hidden"
            variants={cardVariants}
            whileHover="hover"
            style={{ "--highlight-color": "rgb(59,130,246)", "--glow-effect": "0 0 20px 5px rgba(59,130,246,0.5)" }}
          >
            <div className="relative z-10">
              <motion.div 
                className="bg-gray-900 h-12 w-12 flex items-center justify-center rounded-lg mb-6"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Listing Wizard</h2>
              <p className="text-gray-400 font-mono">Generate high-converting titles, SEO keywords, and descriptions in seconds—crafted to make your product stand out on Amazon, Shopify, or any platform.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black pointer-events-none"></div>
          </motion.div>

          {/* Card 2 - Tall Card */}
          <motion.div 
            className="bg-black rounded-xl p-6 border border-gray-800 relative overflow-hidden md:row-span-2"
            variants={cardVariants}
            whileHover="hover"
            style={{ "--highlight-color": "rgb(168,85,247)", "--glow-effect": "0 0 20px 5px rgba(168,85,247,0.5)" }}
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <motion.div 
                  className="bg-gray-900 h-12 w-12 flex items-center justify-center rounded-lg mb-6"
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Bundle Builder</h2>
                <p className="text-gray-400 font-mono mt-4">Boost sales by automatically suggesting product pairings customers love. Turn ‘maybe’ buyers into ‘add to cart’ fans.</p>
              </div>
              <div className="mt-auto pt-8">
                <p className="text-gray-400 font-mono">Explore more features <span className="text-white underline cursor-pointer"  onClick={() => navigate("/features")}> Click Here</span>.</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black pointer-events-none"></div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="bg-black rounded-xl p-6 border border-gray-800 relative overflow-hidden"
            variants={cardVariants}
            whileHover="hover"
            style={{ "--highlight-color": "rgb(52,211,153)", "--glow-effect": "0 0 20px 5px rgba(52,211,153,0.5)" }}
          >
            <div className="relative z-10">
              <motion.div 
                className="bg-gray-900 h-12 w-12 flex items-center justify-center rounded-lg mb-6"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Product Genius</h2>
              <p className="text-gray-400 font-mono">Ask anything about your product! Get instant answers, improvement tips, and even predict customer questions—all powered by AI.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black pointer-events-none"></div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            className="bg-black rounded-xl p-6 border border-gray-800 relative overflow-hidden"
            variants={cardVariants}
            whileHover="hover"
            style={{ "--highlight-color": "rgb(249,115,22)", "--glow-effect": "0 0 20px 5px rgba(249,115,22,0.5)" }}
          >
            <div className="relative z-10">
              <motion.div 
                className="bg-gray-900 h-12 w-12 flex items-center justify-center rounded-lg mb-6"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Price Pilot</h2>
              <p className="text-gray-400 font-mono">Never overprice or undersell again. AI compares competitors and demand trends to pick your perfect price.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black pointer-events-none"></div>
          </motion.div>

          {/* Card 5 */}
          <motion.div 
            className="bg-black rounded-xl p-6 border border-gray-800 relative overflow-hidden"
            variants={cardVariants}
            whileHover="hover"
            style={{ "--highlight-color": "rgb(236,72,153)", "--glow-effect": "0 0 20px 5px rgba(236,72,153,0.5)" }}
          >
            <div className="relative z-10">
              <motion.div 
                className="bg-gray-900 h-12 w-12 flex items-center justify-center rounded-lg mb-6"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Instant Studio</h2>
              <p className="text-gray-400 font-mono">No camera? No problem. Turn basic photos into pro product images (with perfect lighting!) for social media or E-Commerce listings.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black pointer-events-none"></div>
          </motion.div>
        </motion.div>
      );
    };

    return (
      <div className="bg-black text-white min-h-screen p-8">
        <HeaderSection />
        <GridSection />
      </div>
    );
  };

  export default BentoGrid;