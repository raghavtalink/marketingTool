import React, { useEffect } from 'react';
import { motion, useAnimation, useScroll } from 'framer-motion';
import productImage from "../assets/products.png";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';


const BlobAnimation = ({ delay = 0, className }) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.2, 1.1, 1.3, 1],
        x: [0, 20, -20, 30, 0],
        y: [0, 30, -20, 10, 0],
      }}
      transition={{
        duration: 20,
        delay: delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
  );
};

const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const AboutPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        controls.start({ opacity: 0.2 });
      } else {
        controls.start({ opacity: 1 });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  const pathVariant = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  return (
    <div className="bg-black text-gray-100 min-h-screen overflow-hidden">
     
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

      {/* Additional subtle floating particles */}
      <motion.div 
        className="fixed inset-0 z-0 opacity-30"
        animate={controls}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-indigo-500"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
            }}
            transition={{
              duration: 20 + Math.random() * 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>

      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <svg width="100%" height="100%" className="opacity-20">
            <motion.circle
              cx="50%"
              cy="50%"
              r="30%"
              stroke="#6366f1"
              strokeWidth="1"
              fill="none"
              initial="hidden"
              animate="visible"
              variants={pathVariant}
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke="#8b5cf6"
              strokeWidth="0.5"
              fill="none"
              initial="hidden"
              animate="visible"
              variants={pathVariant}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center relative z-10 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mx-auto overflow-hidden">
                {/* Logo or image placeholder */}
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">S</div>
              </div>
              <motion.div 
                className="absolute -inset-1 rounded-full blur opacity-60 bg-gradient-to-r from-purple-600 to-blue-600"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 tracking-tight mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Sellovate
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Your AI-powered partner in the e-commerce journey
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <button
            onClick={scrollToBottom}
             className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium text-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg hover:shadow-indigo-500/30">
              
              Get Started Now
            </button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-0 right-0 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="py-20 px-4 md:px-8 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-300">Selling Online is Tough—We've Been There Too</h2>
              <p className="text-gray-300 mb-6 text-lg">
                You've poured your heart into creating an amazing product. You know it deserves attention, but somehow, it's just not selling the way you expected. Your listings don't get enough clicks. Your competitors always seem to be ahead.
              </p>
              <p className="text-gray-300 mb-6 text-lg">
                We get it. We've been there too.
              </p>
              <p className="text-gray-300 text-lg">
                That's why we built Sellovate—not just as another tool, but as an AI-powered partner that takes the guesswork out of selling online. Whether you're a small business owner, an independent seller, or a growing e-commerce brand, Sellovate helps you sell smarter, faster, and better.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInScale}
              className="order-1 md:order-2 relative"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl  ">
                <div className="aspect-w-4 aspect-h-3">
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center ">
                    <img src={productImage} alt="Product" className="w-100 h-120" />
                    </div>
                  </div>
                </div>
                <motion.div
                  className="absolute -inset-0.5 "
                 
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* What is Sellovate Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="py-20 px-4 md:px-8 bg-gray-800/20 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-500/20 backdrop-blur-3xl"
              style={{
                width: `${Math.random() * 400 + 200}px`,
                height: `${Math.random() * 400 + 200}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">What is Sellovate?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Think of Sellovate as your personal AI sales assistant—one that never sleeps, never makes mistakes, and always knows what works. It's designed to help you optimize your product listings, improve visibility, and boost sales without the stress of trial and error.
            </p>
            <div className="mt-8 inline-block bg-gray-800/60 px-6 py-3 rounded-full text-indigo-300 font-medium backdrop-blur-sm">
              <span className="mr-2">💡</span> No guesswork. No technical jargon. Just real results.
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "✨",
                title: "AI Creates Perfect Listings",
                description: "No more staring at a blank screen! Our AI Listing Wizard generates high-converting titles and compelling descriptions."
              },
              {
                icon: "💰",
                title: "Goodbye to Pricing Guesswork",
                description: "ProfitMax Smart Pricing analyzes the market to suggest the most competitive and profitable price."
              },
              {
                icon: "📊",
                title: "Stay Ahead with Insights",
                description: "Get real-time data on trending products and competitor strategies—giving you an unfair advantage."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInScale}
                className="bg-gray-850/40 p-6 rounded-xl backdrop-blur-sm bg-opacity-50 border border-gray-700 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-600/90 to-purple-600/90 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-indigo-700/20 group-hover:shadow-indigo-700/40 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-indigo-200 group-hover:text-white transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How Sellovate Works Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
        className="py-20 px-4 md:px-8 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">How Sellovate Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A Seller's Journey from Struggle to Success
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/0 via-indigo-500/80 to-indigo-500/0 transform -translate-x-1/2 hidden md:block"></div>
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="space-y-24 relative"
            >
              {[
                {
                  step: "1️⃣",
                  title: "The Struggle Begins",
                  content: "You've listed your product online, but days go by, and sales are disappointingly low. You tweak your descriptions, experiment with pricing, and even try running ads—but nothing seems to click."
                },
                {
                  step: "2️⃣",
                  title: "Enter Sellovate",
                  content: "You come across Sellovate and decide to give it a shot. No complicated setup, no integrations—just enter your product details, and let the AI work its magic."
                },
                {
                  step: "3️⃣",
                  title: "Get AI-Powered Insights—Anytime",
                  content: "Questions about your sales performance? Our AI Product Guru provides real-time insights, competitor analysis, and expert AI suggestions so you can make informed decisions—just like having a sales coach in your pocket."
                },
                {
                  step: "4️⃣",
                  title: "Generate Studio-Quality Product Images",
                  content: "No professional photographer? No problem! Our AI Studio Creator transforms your product images into studio-quality visuals, helping your listings look polished and professional—without the hefty price tag."
                },
                {
                  step: "5️⃣",
                  title: "The Breakthrough Moment",
                  content: "With Sellovate working behind the scenes, your product finally gets noticed, clicks turn into sales, and your business starts growing like never before."
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="grid md:grid-cols-9 gap-8 items-center"
                >
                  <div className={`md:col-span-4 ${index % 2 === 0 ? 'md:order-1' : 'md:order-3'}`}>
                    <div className="bg-gray-800/40 rounded-xl overflow-hidden shadow-2xl relative group">
                      
                      <motion.div
                        className="absolute -inset-0.5 rounded-xl blur opacity-30 bg-gradient-to-r from-purple-600 to-blue-600 z-0 transition-opacity duration-300"
                        animate={{ 
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-1 flex justify-center items-center md:order-2 relative">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold z-10 shadow-lg shadow-indigo-600/50">
                      {item.step.replace('️⃣', '')}
                    </div>
                  </div>
                  
                  <div className={`md:col-span-4 ${index % 2 === 0 ? 'md:order-3' : 'md:order-1'}`}>
                    <h3 className="text-2xl font-bold mb-4 text-indigo-300">{item.title}</h3>
                    <p className="text-gray-300 text-lg">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Why Sellovate Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="py-20 px-4 md:px-8 bg-gray-900/50 backdrop-blur-sm relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 z-0 opacity-30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">Why Sellovate?</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: "✅",
                title: "AI That Thinks Like a Pro",
                description: "No manual work, no technical knowledge required. Just enter your product details and let our AI do the rest."
              },
              {
                icon: "✅",
                title: "Save Time, Sell More",
                description: "What used to take hours (or even days) is now done in seconds—so you can focus on scaling your business."
              },
              {
                icon: "✅",
                title: "Outsmart the Competition",
                description: "Real-time market insights and competitor analysis keep you ahead of the game."
              },
              {
                icon: "✅",
                title: "Affordable & Scalable",
                description: "No overpriced marketing agencies or complex software—just an AI-powered tool that works for every seller."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInScale}
                className="bg-gray-850/40 p-6 rounded-xl backdrop-blur-sm bg-opacity-40 border border-gray-700 hover:border-indigo-500/30 transition-all duration-300 flex"
              >
                <div className="mr-4 mt-1 text-green-400 text-xl">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-200">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="py-20 px-4 md:px-8 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 md:p-12 border border-indigo-500/20 backdrop-blur-sm overflow-hidden relative"
            variants={fadeInScale}
          >
            <motion.div
              className="absolute -inset-1 blur-3xl opacity-30 bg-gradient-to-r from-indigo-500 to-purple-500 z-0"
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Sell Smarter?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of smart sellers who are using Sellovate to optimize their listings, refine their pricing, and market their products like pros.
              </p>
              
              <p className="text-2xl font-medium text-indigo-300 mb-8">
                🚀 It's time to transform your sales game.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button  onClick={() => navigate("/login")} className=" cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-300">
                  Get Started Now →
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      
      <Footer/>
    </div>
  );
};

export default AboutPage;