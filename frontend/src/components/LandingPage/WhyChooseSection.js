import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiBox, FiCpu, FiClock, FiPieChart, FiDollarSign, FiTrendingUp, FiShield, FiUsers } from 'react-icons/fi';
import gsap from 'gsap';
import Squares from './Squares';
import './WhyChooseSection.css';

const reasons = [
    {
        icon: <FiBox />,
        title: "All-in-One Solution",
        description: "Everything you need to succeed in e-commerce, from content creation to market analysis, in one powerful platform.",
        color: "#3b82f6",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    {
        icon: <FiCpu />,
        title: "Advanced AI Technology",
        description: "Powered by cutting-edge artificial intelligence to provide you with the most accurate and effective tools.",
        color: "#8b5cf6",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
    },
    {
        icon: <FiClock />,
        title: "Time-Saving Automation",
        description: "Automate repetitive tasks and focus on growing your business while our AI handles the heavy lifting.",
        color: "#06b6d4",
        gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    {
        icon: <FiPieChart />,
        title: "Data-Driven Decisions",
        description: "Make informed business decisions based on real-time data and AI-powered insights.",
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
        icon: <FiDollarSign />,
        title: "Cost-Effective",
        description: "Reduce operational costs while increasing efficiency and productivity with our automated solutions.",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
        icon: <FiTrendingUp />,
        title: "Scalable Solutions",
        description: "Our platform grows with your business, providing the tools you need at every stage of your journey.",
        color: "#ec4899",
        gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    },
    {
        icon: <FiShield />,
        title: "Enterprise-Grade Security",
        description: "Rest easy knowing your data is protected with state-of-the-art security measures and regular compliance updates.",
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
    },
    {
        icon: <FiUsers />,
        title: "24/7 Expert Support",
        description: "Get help whenever you need it with our round-the-clock customer support team and comprehensive documentation.",
        color: "#14b8a6",
        gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
    }
];

const WhyChooseSection = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    useEffect(() => {
        const cards = document.querySelectorAll('.reason-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });

        // Animate numbers
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-value'));
            gsap.to(stat, {
                innerHTML: target,
                duration: 2,
                snap: { innerHTML: 1 },
                scrollTrigger: {
                    trigger: stat,
                    start: "top center+=100",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }, []);

    return (
        <section ref={sectionRef} className="why-choose-section">
            <div className="squares-background">
                <Squares 
                    speed={0.3} 
                    squareSize={40}
                    direction='diagonal'
                    borderColor='rgba(59, 130, 246, 0.1)'
                    hoverFillColor='rgba(139, 92, 246, 0.1)'
                />
            </div>
            <motion.div style={{ y, opacity }} className="content-wrapper">
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
                            style={{
                                '--card-gradient': reason.gradient
                            }}
                        >
                            <div className="card-content">
                                <div className="reason-icon" style={{ background: reason.gradient }}>
                                    {React.cloneElement(reason.icon, { style: { color: '#fff' } })}
                                </div>
                                <h3>{reason.title}</h3>
                                <p>{reason.description}</p>
                            </div>
                            <div className="card-effects">
                                <div className="gradient-bg"></div>
                                <div className="spotlight"></div>
                                <div className="pixel-grid"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="stats-banner">
                    <motion.div
                        className="stat-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="stat-item">
                            <span className="stat-number" data-value="10000">0</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-glow"></div>
                    </motion.div>
                    {/* Add more stats similarly */}
                </div>
            </motion.div>
        </section>
    );
};

export default WhyChooseSection;