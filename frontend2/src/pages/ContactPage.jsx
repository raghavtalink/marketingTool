import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    nextStep();
  };

  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 py-6 px-8">
          <h1 className="text-2xl font-bold text-white text-center">Get in Touch</h1>
          <p className="text-indigo-100 text-center mt-2">
            We're here to help with any questions you might have
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Let's get started</h2>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <p className="text-gray-600 mb-6">
                  Having an issue or want to work with us? We're here to help!
                </p>
                <button
                  onClick={nextStep}
                  disabled={!formData.name}
                  className={`w-full py-3 rounded-lg font-medium text-white ${
                    formData.name ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'
                  } transition-colors duration-300`}
                >
                  Get Started
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8"
                onSubmit={handleSubmit}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Tell us more</h2>
                <div className="mb-5">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Your email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 mb-2">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={!formData.email || !formData.message}
                  className={`w-full py-3 rounded-lg font-medium text-white ${
                    formData.email && formData.message ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'
                  } transition-colors duration-300`}
                >
                  Send Message
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h2>
                <p className="text-gray-600 mb-6">
                  Your message is on the way. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  className="px-6 py-2 rounded-lg font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;