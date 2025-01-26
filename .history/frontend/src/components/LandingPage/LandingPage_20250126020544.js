import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Squares from './Squares';
import FeatureCard from './FeatureCard';
import { FiAperture, FiBox, FiMessageSquare, FiDollarSign, FiCamera, FiTrendingUp, FiShare2, FiTarget, FiZap, FiShield, FiClock, FiTrendingDown } from 'react-icons/fi';
import BlobCursor from './BlobCursor';
import './LandingPage.css';
import FeatureSection from './FeatureSection';
import WhyChooseSection from './WhyChooseSection';
import PricingSection from './PricingSection';
import Ballpit from './Ballpit';
import Navbar from '../Common/Navbar';
import HowItWorks from './HowItWorks';


const LandingPage = () => {
    return (
        <>
            <BlobCursor />
            <div className="landing-page">
            <Navbar />
                {/* Hero Section First */}
                <section className="hero-section">
                    {/* Background Elements */}
                    <div className="background-layer">
                        <div className="squares-background">
                            <Squares 
                                speed={0.5} 
                                squareSize={40}
                                direction='diagonal'
                                borderColor='rgba(255,255,255,0.1)'
                                hoverFillColor='rgba(59, 130, 246, 0.1)'
                            />
                        </div>
                    </div>
                    
                    {/* Ballpit Animation */}
                    <div className="ballpit-layer">
                        <div className="ballpit-container">
                            <Ballpit
                                count={50}
                                gravity={0.5}
                                friction={0.9975}
                                wallBounce={0.95}
                                followCursor={true}
                                colors={[0x3b82f6, 0x8b5cf6, 0x6366f1]}
                            />
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="hero-content">
                        <div className="glass-card">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="hero-title"
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
                    </div>
                </section>

                

                {/* Features Section Second */}
                <div className="features-container">
                    {features.map((feature, index) => (
                        <FeatureSection 
                            key={index}
                            feature={feature}
                            index={index}
                            isOdd={index % 2 !== 0}
                        />
                    ))}
                </div>

                {/* Why Choose Section Third */}
                <WhyChooseSection />

                {/* Pricing Section Fourth */}
                <PricingSection />

                {/* CTA Section Last */}
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
        </>
    );
};

const features = [
    {
        icon: <FiAperture className="feature-icon" />,
        title: "AI Content Generator",
        subtitle: "Create Compelling Content in Seconds",
        description: "Transform your product listings into conversion machines. Our AI generates SEO-optimized descriptions that capture attention and drive sales, saving you hours of writing time.",
        highlights: [
            "SEO-optimized product descriptions",
            "Engaging marketing copy",
            "Multi-language support",
            "Brand voice consistency"
        ]
    },
    {
        icon: <FiBox className="feature-icon" />,
        title: "Product Combo Analyzer",
        subtitle: "Unlock Hidden Revenue Opportunities",
        description: "Discover profitable product combinations that your competitors miss. Our AI analyzes purchasing patterns to suggest bundles that customers actually want to buy.",
        highlights: [
            "Smart bundle recommendations",
            "Price optimization",
            "Customer behavior insights",
            "Real-time market analysis"
        ]
    },
    {
        icon: <FiMessageSquare className="feature-icon" />,
        title: "Smart Support Chatbot",
        subtitle: "24/7 Customer Support That Gets Smarter",
        description: "Your tireless support team member. Our AI chatbot learns from every interaction, providing instant, accurate responses to customer queries, even outside business hours.",
        highlights: [
            "24/7 instant responses",
            "Multi-language support",
            "Learning from interactions",
            "Seamless human handoff"
        ]
    },
    {
        icon: <FiDollarSign className="feature-icon" />,
        title: "Dynamic Pricing Optimizer",
        subtitle: "Maximize Profits Intelligently",
        description: "Stay competitive and maximize profits with our AI-driven pricing engine. Automatically adjust prices based on market conditions, competitor analysis, and demand patterns.",
        highlights: [
            "Real-time price adjustments",
            "Competitor price tracking",
            "Demand-based pricing",
            "Profit margin optimization"
        ]
    },
    {
        icon: <FiCamera className="feature-icon" />,
        title: "AI Studio Designer",
        subtitle: "Professional Visuals Made Simple",
        description: "Create stunning product photos and marketing materials in minutes. Our AI-powered design studio helps you produce professional-grade visuals without the need for complex software.",
        highlights: [
            "One-click background removal",
            "Auto-enhance photos",
            "Brand template creation",
            "Batch processing"
        ]
    },
    {
        icon: <FiTrendingUp className="feature-icon" />,
        title: "Market Trend Analyzer",
        subtitle: "Stay Ahead of the Competition",
        description: "Make data-driven decisions with our advanced market analysis tools. Spot trends before they emerge and adapt your strategy to stay ahead of the competition.",
        highlights: [
            "Trend prediction",
            "Competitor analysis",
            "Market opportunity alerts",
            "Custom reporting"
        ]
    },
    {
        icon: <FiShare2 className="feature-icon" />,
        title: "Campaign Manager",
        subtitle: "Automate Your Marketing Success",
        description: "Design and execute powerful social media campaigns that convert. Our AI optimizes your content and timing to reach your audience when they're most engaged.",
        highlights: [
            "AI content scheduling",
            "Multi-platform management",
            "Performance analytics",
            "Audience insights"
        ]
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