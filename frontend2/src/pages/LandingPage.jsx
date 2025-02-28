import React from "react";
import { motion } from "framer-motion";
import bgImage from "../assets/bgImage.png";
import BentoGrid from "../Layouts/BentoGrid";
import FAQComponent from "../Layouts/FAQ";

export default function HeroSection() {
  return (
    <>
      <div className="bg-black h-screen px-10">
        <section
          className="relative top-40 h-[78vh] flex flex-col items-center justify-center text-center text-white py-20 rounded-t-3xl overflow-hidden"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tl from-black/60 via-black/50 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          ></motion.div>

          <motion.div 
            className="relative max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="p-8">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Welcome to{" "}
                <motion.span 
                  className="bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  Sellovate
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-lg text-gray-300 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Revolutionize Your E-commerce Journey with AI-Powered Solutions
              </motion.p>

              <motion.p 
                className="text-gray-300 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                Transform your online business with cutting-edge AI technology.
                Create, optimize, and scale your e-commerce presence like never
                before.
              </motion.p>

              <motion.div 
                className="mt-6 flex justify-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                <motion.button 
                  className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                </motion.button>
                <motion.button 
                  className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get in Touch
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
      <BentoGrid />

      <FAQComponent />
    </>
  );
}