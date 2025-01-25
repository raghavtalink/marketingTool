import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import './PricingSection.css';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);

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
            color: "#94a3b8"
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
            color: "#3b82f6"
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
            color: "#8b5cf6"
        }
    ];

    return (
        <section className="pricing-section">
            <div className="pricing-container">
                <div className="pricing-header">
                    <h2>Simple, Transparent Pricing</h2>
                    <p>Choose the perfect plan for your business</p>
                    
                    <div className="toggle-container">
                        <span className={!isYearly ? 'active' : ''}>Monthly</span>
                        <button 
                            className={`toggle-switch ${isYearly ? 'active' : ''}`}
                            onClick={() => setIsYearly(!isYearly)}
                        >
                            <span className="toggle-slider"></span>
                        </button>
                        <span className={isYearly ? 'active' : ''}>
                            Yearly
                            <span className="save-badge">Save 25%</span>
                        </span>
                    </div>
                </div>

                <div className="pricing-cards">
                    {tiers.map((tier, index) => (
                        <div 
                            key={index}
                            className={`pricing-card ${tier.highlight ? 'highlighted' : ''}`}
                            style={{ '--card-color': tier.color }}
                        >
                            <div className="card-header">
                                <h3>{tier.name}</h3>
                                <p>{tier.description}</p>
                                <div className="price-container">
                                    <div className="price">
                                        <span className="currency">USD</span>
                                        {tier.priceUSD}
                                        <span className="period">/{isYearly ? 'year' : 'month'}</span>
                                    </div>
                                    <div className="price-inr">
                                        <span className="currency">INR</span>
                                        {tier.priceINR}
                                        <span className="period">/{isYearly ? 'year' : 'month'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="features">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className={`feature ${!feature.included ? 'disabled' : ''}`}>
                                        {feature.included !== false ? 
                                            <FiCheck className="icon" /> : 
                                            <FiX className="icon" />
                                        }
                                        <div className="feature-text">
                                            <span>{feature.name}</span>
                                            <small>{feature.detail}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="cta-button" style={{ backgroundColor: tier.color }}>
                                {tier.ctaText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;