import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiChevronDown } from 'react-icons/fi';
import './PricingSection.css';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [expandedTier, setExpandedTier] = useState(null);

    const tiers = [
        {
            name: "Freeloader",
            description: "Perfect for getting started with e-commerce automation",
            priceUSD: "Free",
            priceINR: "Free",
            highlight: false,
            features: [
                { name: "AI Content Generator", detail: "Generate up to 3 listings/month" },
                { name: "Competitor Analysis", detail: "Analyze 1 competitor listing/week" },
                { name: "Pricing Strategy", detail: "Simple pricing tips" },
                { name: "Social Media Content", detail: "5 captions/month" },
                { name: "Image Creator", detail: "3 images/month" },
                { name: "Market Trends", detail: "1 trend report/month" },
                { name: "Campaign Creation", detail: "Not available", included: false },
                { name: "Custom Templates", detail: "Limited templates" },
                { name: "Team Access", detail: "Single user" },
                { name: "API Access", detail: "Not available", included: false }
            ],
            ctaText: "Get Started Free",
            gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
        },
        {
            name: "Hustler",
            description: "For growing businesses ready to scale",
            priceUSD: isYearly ? "$15" : "$20",
            priceINR: isYearly ? "₹999" : "₹1,499",
            highlight: true,
            features: [
                { name: "AI Content Generator", detail: "Unlimited listings" },
                { name: "Competitor Analysis", detail: "Up to 10 competitor listings/month" },
                { name: "Pricing Strategy", detail: "Advanced pricing with cost/profit analysis" },
                { name: "Social Media Content", detail: "50 captions/month" },
                { name: "Image Creator", detail: "25 images/month" },
                { name: "Market Trends", detail: "Weekly trend reports" },
                { name: "Campaign Creation", detail: "5 campaigns/month" },
                { name: "Custom Templates", detail: "Access to premium templates" },
                { name: "Team Access", detail: "Single user" },
                { name: "API Access", detail: "Not available", included: false }
            ],
            ctaText: "Start Free Trial",
            gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        },
        {
            name: "Trailblazer",
            description: "For serious sellers aiming for market leadership",
            priceUSD: isYearly ? "$60" : "$80",
            priceINR: isYearly ? "₹4,999" : "₹6,499",
            highlight: false,
            features: [
                { name: "AI Content Generator", detail: "Unlimited listings with multi-language support" },
                { name: "Competitor Analysis", detail: "Unlimited competitor insights" },
                { name: "Pricing Strategy", detail: "Dynamic pricing based on real-time market data" },
                { name: "Social Media Content", detail: "Unlimited captions with audience targeting" },
                { name: "Image Creator", detail: "Unlimited images with advanced editing features" },
                { name: "Market Trends", detail: "Real-time trend analysis and forecasting" },
                { name: "Campaign Creation", detail: "Unlimited campaigns with AI-driven optimization" },
                { name: "Custom Templates", detail: "Fully customizable templates" },
                { name: "Team Access", detail: "Multi-user accounts with collaboration tools" },
                { name: "API Access", detail: "Full API integration for automation" }
            ],
            ctaText: "Contact Sales",
            gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
        }
    ];

    return (
        <section className="pricing-section">
            <div className="pricing-bg"></div>
            <div className="content-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="section-header"
                >
                    <h2>Simple, Transparent Pricing</h2>
                    <p className="subtitle">Choose the perfect plan for your business</p>
                    
                    <div className="pricing-toggle">
                        <span className={!isYearly ? 'active' : ''}>Monthly</span>
                        <button 
                            className={`toggle-switch ${isYearly ? 'yearly' : ''}`}
                            onClick={() => setIsYearly(!isYearly)}
                        >
                            <span className="toggle-slider"></span>
                        </button>
                        <span className={isYearly ? 'active' : ''}>
                            Yearly
                            <span className="save-badge">Save 25%</span>
                        </span>
                    </div>
                </motion.div>

                <div className="pricing-cards">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            className={`pricing-card ${tier.highlight ? 'highlighted' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="card-header" style={{ background: tier.gradient }}>
                                <h3>{tier.name}</h3>
                                <p>{tier.description}</p>
                                <div className="price">
                                    <span className="currency">USD</span>
                                    <span className="amount">{tier.priceUSD}</span>
                                    <span className="period">/{isYearly ? 'year' : 'month'}</span>
                                </div>
                                <div className="price-inr">
                                    <span className="currency">INR</span>
                                    <span className="amount">{tier.priceINR}</span>
                                    <span className="period">/{isYearly ? 'year' : 'month'}</span>
                                </div>
                            </div>
                            <div className="card-content">
                                <ul className="features-list">
                                    {tier.features.slice(0, 5).map((feature, idx) => (
                                        <li key={idx} className={!feature.included ? 'disabled' : ''}>
                                            {feature.included !== false ? (
                                                <FiCheck className="icon" />
                                            ) : (
                                                <FiX className="icon" />
                                            )}
                                            <span>{feature.name}</span>
                                            <small>{feature.detail}</small>
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    className="expand-features"
                                    onClick={() => setExpandedTier(expandedTier === index ? null : index)}
                                >
                                    {expandedTier === index ? 'Show less' : 'Show all features'}
                                    <FiChevronDown className={`icon ${expandedTier === index ? 'rotated' : ''}`} />
                                </button>
                                {expandedTier === index && (
                                    <ul className="features-list expanded">
                                        {tier.features.slice(5).map((feature, idx) => (
                                            <li key={idx} className={!feature.included ? 'disabled' : ''}>
                                                {feature.included !== false ? (
                                                    <FiCheck className="icon" />
                                                ) : (
                                                    <FiX className="icon" />
                                                )}
                                                <span>{feature.name}</span>
                                                <small>{feature.detail}</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button className="cta-button" style={{ background: tier.gradient }}>
                                    {tier.ctaText}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="comparison-table">
                    <h3>Detailed Feature Comparison</h3>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    {tiers.map((tier, index) => (
                                        <th key={index}>{tier.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tiers[0].features.map((feature, index) => (
                                    <tr key={index}>
                                        <td>{feature.name}</td>
                                        {tiers.map((tier, tierIndex) => (
                                            <td key={tierIndex}>
                                                {tier.features[index].detail}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;