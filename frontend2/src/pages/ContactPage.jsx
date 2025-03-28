import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from "@emailjs/browser";
import Footer from '../components/Footer';

// Blob Animation Component
const BlobAnimation = ({ delay, className }) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 20, 0],
        y: [0, 15, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
        delay: delay || 0,
      }}
    />
  );
};

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    if (!formData.email || !formData.message) return;

    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
      user_message: formData.message,
    };
    emailjs
    .send("service_jf5j8sl", "template_5ulkt9v", templateParams, "lmWXYkUl7xjWuief_nT5L")
    .then(
      (response) => {
        console.log("✅ Email sent:", response);
        alert("Email sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
        setStep(3);
      },
      (error) => {
        console.error("Email send error:", error);
        alert("Failed to send email.");
      }
    );
    console.log('Form submitted:', formData);
    nextStep();
  };

  // Enhanced animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4 }
    })
  };

  return (
   <>
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blob Animation Background */}
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
      
      <motion.div 
        className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl overflow-hidden relative z-10 border border-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-pink-500 py-6 px-8 relative"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-white text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            className="text-gray-100 text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            We're here to help with any questions you might have
          </motion.p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full ${i === step ? 'bg-white w-8' : 'bg-gray-600 w-4'}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <motion.h2 
                  custom={0}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xl font-semibold text-gray-100 mb-4"
                >
                  Let's get started
                </motion.h2>
                
                <motion.div 
                  custom={1}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-4"
                >
                  <label htmlFor="name" className="block text-gray-300 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                    required
                  />
                </motion.div>
                
                <motion.p 
                  custom={2}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-gray-400 mb-4"
                >
                  Having an issue or want to work with us? We're here to help!
                </motion.p>
                
                <motion.div
                  custom={3}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    onClick={nextStep}
                    disabled={!formData.name}
                    whileHover={{ scale: formData.name ? 1.02 : 1 }}
                    whileTap={{ scale: formData.name ? 0.98 : 1 }}
                    className={`w-full py-3 rounded-lg font-medium text-white ${
                      formData.name ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'bg-gray-700 cursor-not-allowed'
                    } transition-colors duration-300`}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="p-6"
                onSubmit={handleSubmit}
              >
                <motion.h2 
                  custom={0}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xl font-semibold text-gray-100 mb-4"
                >
                  Tell us more
                </motion.h2>
                
                <motion.div 
                  custom={1}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-4"
                >
                  <label htmlFor="email" className="block text-gray-300 mb-1">
                    Your email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="email@example.com"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  custom={2}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-4"
                >
                  <label htmlFor="message" className="block text-gray-300 mb-1">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-24 transition-all duration-200"
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </motion.div>
                
                <motion.div
                  custom={3}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    type="submit"
                    disabled={!formData.email || !formData.message}
                    whileHover={{ scale: (formData.email && formData.message) ? 1.02 : 1 }}
                    whileTap={{ scale: (formData.email && formData.message) ? 0.98 : 1 }}
                    className={`w-full py-3 rounded-lg font-medium text-white ${
                      formData.email && formData.message ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' : 'bg-gray-700 cursor-not-allowed'
                    } transition-colors duration-300`}
                  >
                    Send Message
                  </motion.button>
                </motion.div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="p-6 text-center"
              >
                <motion.div 
                  className="mx-auto mb-5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto" 
                    style={{
                      boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)'
                    }}>
                    <motion.svg 
                      className="w-8 h-8 text-green-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </motion.svg>
                  </div>
                </motion.div>
                
                <motion.h2 
                  className="text-2xl font-semibold text-gray-100 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Thank you!
                </motion.h2>
                
                <motion.p 
                  className="text-gray-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Your message is on the way. We'll get back to you as soon as possible.
                </motion.p>
                
                <motion.button
                  onClick={() => {
                    setStep(1);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  className="px-6 py-2 rounded-lg font-medium text-purple-400 border border-purple-500 hover:bg-purple-900 hover:bg-opacity-30 transition-colors duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  Send another message
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
      <Footer/>
   </>
  );
};

export default ContactForm;