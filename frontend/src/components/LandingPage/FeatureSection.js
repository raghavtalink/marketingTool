import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Squares from './Squares';
import './FeatureSection.css';

gsap.registerPlugin(ScrollTrigger);

const FeatureSection = ({ feature, index, isOdd }) => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        const card = cardRef.current;

        gsap.fromTo(content,
            {
                opacity: 0,
                x: isOdd ? -100 : 100
            },
            {
                opacity: 1,
                x: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: "top center",
                    end: "bottom center",
                    toggleActions: "play none none reverse"
                }
            }
        );

        gsap.fromTo(card,
            {
                opacity: 0,
                y: 100,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: "top center",
                    end: "bottom center",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, [isOdd]);

    return (
        <section ref={sectionRef} className={`feature-section ${isOdd ? 'odd' : 'even'}`}>
            <div className="squares-background">
                <Squares 
                    speed={0.3} 
                    squareSize={40}
                    direction={isOdd ? 'diagonal-left' : 'diagonal-right'}
                    borderColor='rgba(255,255,255,0.1)'
                    hoverFillColor='rgba(59, 130, 246, 0.1)'
                />
            </div>
            <div className="feature-container">
                <div ref={contentRef} className="feature-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="content-wrapper"
                    >
                        <div className="icon-wrapper">
                            {feature.icon}
                            <div className="icon-background"></div>
                        </div>
                        <div className="feature-subtitle">{feature.subtitle}</div>
                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>
                        <div className="feature-highlights">
                            {feature.highlights.map((highlight, idx) => (
                                <motion.div
                                    key={idx}
                                    className="highlight-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {highlight}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                <div className="feature-visual">
                    <div ref={cardRef} className="feature-card-container">
                        <motion.div
                            className="feature-card-combined"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="feature-demo">
                                {/* Custom demo content based on feature type */}
                                {getFeatureDemo(feature.title)}
                            </div>
                            <div className="card-effects">
                                <div className="gradient-bg"></div>
                                <div className="spotlight-overlay"></div>
                                <div className="pixel-grid"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Helper function to render different demos for each feature
const getFeatureDemo = (featureTitle) => {
    switch(featureTitle) {
        case "AI Content Generator":
            return (
                <div className="typing-demo">
                    <div className="code-window">
                        <div className="window-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="typing-text">
                            <span className="cursor">|</span>
                        </div>
                    </div>
                </div>
            );
        case "Product Combo Analyzer":
            return (
                <div className="analyzer-demo">
                    <div className="chart-container">
                        {/* Add animated chart elements */}
                    </div>
                </div>
            );
        // Add more cases for other features
        default:
            return null;
    }
};

export default FeatureSection;