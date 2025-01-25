import React from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiCpu, FiClock, FiPieChart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './WhyChooseSection.css';

const reasons = [
    {
        icon: <FiBox />,
        title: "All-in-One Solution",
        description: "Everything you need to succeed in e-commerce, from content creation to market analysis, in one powerful platform.",
        color: "#3b82f6"
    },
    {
        icon: <FiCpu />,
        title: "Advanced AI Technology",
        description: "Powered by cutting-edge artificial intelligence to provide you with the most accurate and effective tools.",
        color: "#8b5cf6"
    },
    {
        icon: <FiClock />,
        title: "Time-Saving Automation",
        description: "Automate repetitive tasks and focus on growing your business while our AI handles the heavy lifting.",
        color: "#06b6d4"
    },
    {
        icon: <FiPieChart />,
        title: "Data-Driven Decisions",
        description: "Make informed business decisions based on real-time data and AI-powered insights.",
        color: "#10b981"
    },
    {
        icon: <FiDollarSign />,
        title: "Cost-Effective",
        description: "Reduce operational costs while increasing efficiency and productivity with our automated solutions.",
        color: "#f59e0b"
    },
    {
        icon: <FiTrendingUp />,
        title: "Scalable Solutions",
        description: "Our platform grows with your business, providing the tools you need at every stage of your journey.",
        color: "#ec4899"
    }
];

const WhyChooseSection = () => {
    return (
        <section className="why-choose-section">
            <div className="hexagon-bg"></div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="section-header"
            >
                <h2>Why Choose Sellovate?</h2>
                <p className="subtitle">Join thousands of successful sellers who trust our platform</p>
            </motion.div>

            <div className="reasons-grid">
                {reasons.map((reason, index) => (
                    <motion.div
                        key={index}
                        className="reason-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div 
                            className="reason-icon"
                            style={{ 
                                background: `linear-gradient(135deg, ${reason.color}20, ${reason.color}10)`,
                                borderColor: `${reason.color}30`
                            }}
                        >
                            {React.cloneElement(reason.icon, { style: { color: reason.color } })}
                            <div className="icon-blur" style={{ background: reason.color }}></div>
                        </div>
                        <h3>{reason.title}</h3>
                        <p>{reason.description}</p>
                        <div className="card-border" style={{ borderColor: `${reason.color}30` }}></div>
                    </motion.div>
                ))}
            </div>

            <div className="stats-banner">
                <motion.div
                    className="stat-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="stat-number">10k+</span>
                    <span className="stat-label">Active Users</span>
                </motion.div>
                <motion.div
                    className="stat-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <span className="stat-number">1M+</span>
                    <span className="stat-label">Products Optimized</span>
                </motion.div>
                <motion.div
                    className="stat-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <span className="stat-number">98%</span>
                    <span className="stat-label">Satisfaction Rate</span>
                </motion.div>
            </div>
        </section>
    );
};

export default WhyChooseSection;