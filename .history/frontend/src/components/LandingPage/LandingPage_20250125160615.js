import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Squares from './Squares';
import FeatureCard from './FeatureCard';
import { FiAperture, FiBox, FiMessageSquare, FiDollarSign, FiImage, FiTrendingUp, FiShare2, FiTarget, FiZap, FiShield, FiClock, FiTrendingDown } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="squares-background">
                    <Squares 
                        speed={0.5} 
                        squareSize={40}
                        direction='diagonal'
                        borderColor='rgba(255,255,255,0.1)'
                        hoverFillColor='rgba(59, 130, 246, 0.1)'
                    />
                </div>
                <div className="hero-content">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Welcome to <span className="gradient-text">Sellovate</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-subtitle"
                    >
                        Revolutionize Your E-commerce Journey with AI-Powered Solutions
                    </motion.p>
                    <motion.p 
                        className="hero-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Transform your online business with cutting-edge AI technology. Create, optimize, and scale your e-commerce presence like never before.
                    </motion.p>
                    <motion.button 
                        className="cta-button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Get Started Free
                    </motion.button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <h2>Our AI-Powered Features</h2>
                <p className="section-subtitle">Comprehensive tools to supercharge your e-commerce success</p>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="why-us-section">
                <h2>Why Choose Sellovate?</h2>
                <p className="section-subtitle">Join thousands of successful sellers who trust our platform</p>
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <motion.div 
                            className="benefit-card"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            key={index}
                        >
                            {benefit.icon}
                            <h3>{benefit.title}</h3>
                            <p>{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <motion.div 
                    className="cta-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2>Ready to Transform Your Business?</h2>
                    <p>Join the next generation of successful e-commerce entrepreneurs</p>
                    <button className="cta-button">Start Your Free Trial</button>
                    <p className="cta-subtext">No credit card required • 14-day free trial • Full access to all features</p>
                </motion.div>
            </section>
        </div>
    );
};

const features = [
    {
        icon: <FiAperture className="feature-icon" />,
        title: "AI Content Generator",
        description: "Create compelling product descriptions, SEO-optimized titles, and engaging listings in seconds with our advanced AI content generation system."
    },
    {
        icon: <FiBox className="feature-icon" />,
        title: "Product Combo Analyzer",
        description: "Discover profitable product combinations and bundle opportunities using AI-powered market analysis and customer behavior patterns."
    },
    {
        icon: <FiMessageSquare className="feature-icon" />,
        title: "Smart Support Chatbot",
        description: "Provide instant, intelligent customer support with our AI chatbot that understands your products and customer needs."
    },
    {
        icon: <FiDollarSign className="feature-icon" />,
        title: "Dynamic Pricing Optimizer",
        description: "Maximize profits with AI-driven pricing strategies that adapt to market conditions and competition in real-time."
    },
    {
        icon: <FiImage className="feature-icon" />,
        title: "AI Studio Designer",
        description: "Create professional product photos and marketing materials with our Canva-like AI-powered design studio."
    },
    {
        icon: <FiTrendingUp className="feature-icon" />,
        title: "Market Trend Analyzer",
        description: "Stay ahead of the competition with AI-powered market insights, trend predictions, and competitor analysis."
    },
    {
        icon: <FiShare2 className="feature-icon" />,
        title: "Campaign Manager",
        description: "Design and execute powerful social media marketing campaigns with AI-optimized content and timing."
    }
];

const benefits = [
    {
        icon: <FiZap className="benefit-icon" />,
        title: "All-in-One Solution",
        description: "Everything you need to succeed in e-commerce, from content creation to market analysis, in one powerful platform."
    },
    {
        icon: <FiShield className="benefit-icon" />,
        title: "Advanced AI Technology",
        description: "Powered by cutting-edge artificial intelligence to provide you with the most accurate and effective tools."
    },
    {
        icon: <FiClock className="benefit-icon" />,
        title: "Time-Saving Automation",
        description: "Automate repetitive tasks and focus on growing your business while our AI handles the heavy lifting."
    },
    {
        icon: <FiTarget className="benefit-icon" />,
        title: "Data-Driven Decisions",
        description: "Make informed business decisions based on real-time data and AI-powered insights."
    },
    {
        icon: <FiTrendingDown className="benefit-icon" />,
        title: "Cost-Effective",
        description: "Reduce operational costs while increasing efficiency and productivity with our automated solutions."
    },
    {
        icon: <FiBox className="benefit-icon" />,
        title: "Scalable Solutions",
        description: "Our platform grows with your business, providing the tools you need at every stage of your journey."
    }
];

export default LandingPage;