import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import Squares from './Squares';
import './PricingSection.css';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);

    const tiers = [
        {
            name: "Freeloader",
            description: "Perfect for getting started with e-commerce automation",
            priceUSD: "Free",
            priceINR: "Free",
            color: "var(--freeloader-color)",
            features: [
                { name: "AI Content Generator", detail: "Generate up to 3 listings/month" },
                { name: "Competitor Analysis", detail: "Analyze 1 competitor listing/week" },
                { name: "Pricing Strategy", detail: "Simple pricing tips" },
                { name: "Social Media Content", detail: "5 captions/month" },
                { name: "Image Creator", detail: "3 images/month" },
                { name: "Market Trends", detail: "1 trend report/month" }
            ]
        },
        {
            name: "Hustler",
            description: "For growing businesses ready to scale",
            priceUSD: isYearly ? "$15" : "$20",
            priceINR: isYearly ? "₹999" : "₹1,499",
            color: "var(--hustler-color)",
            features: [
                { name: "AI Content Generator", detail: "Unlimited listings" },
                { name: "Competitor Analysis", detail: "Up to 10 competitor listings/month" },
                { name: "Pricing Strategy", detail: "Advanced pricing with cost/profit analysis" },
                { name: "Social Media Content", detail: "50 captions/month" },
                { name: "Image Creator", detail: "25 images/month" },
                { name: "Market Trends", detail: "Weekly trend reports" }
            ]
        },
        {
            name: "Trailblazer",
            description: "For serious sellers aiming for market leadership",
            priceUSD: isYearly ? "$60" : "$80",
            priceINR: isYearly ? "₹4,999" : "₹6,499",
            color: "var(--trailblazer-color)",
            features: [
                { name: "AI Content Generator", detail: "Unlimited listings with multi-language support" },
                { name: "Competitor Analysis", detail: "Unlimited competitor insights" },
                { name: "Pricing Strategy", detail: "Dynamic pricing based on real-time market data" },
                { name: "Social Media Content", detail: "Unlimited captions with audience targeting" },
                { name: "Image Creator", detail: "Unlimited images with advanced editing features" },
                { name: "Market Trends", detail: "Real-time trend analysis and forecasting" }
            ]
        }
    ];

    return (
        <section className="pricing-section">
            <div className="squares-background">
                <Squares 
                    speed={0.3} 
                    squareSize={40}
                    direction='diagonal'
                    borderColor='rgba(59, 130, 246, 0.1)'
                    hoverFillColor='rgba(139, 92, 246, 0.1)'
                />
            </div>
            
            <div className="pricing-container">
                <div className="pricing-header">
                    <h2>Simple, Transparent Pricing</h2>
                    <p>Choose the perfect plan for your business</p>
                    
                    <div className="toggle-wrapper">
                        <span 
                            className={!isYearly ? 'active' : ''} 
                            onClick={() => setIsYearly(false)}
                        >
                            Monthly
                        </span>
                        <span 
                            className={isYearly ? 'active' : ''} 
                            onClick={() => setIsYearly(true)}
                        >
                            Yearly
                            {isYearly && <div className="save-tag">Save 25%</div>}
                        </span>
                    </div>
                </div>

                <div className="pricing-cards">
                    {tiers.map((tier, index) => (
                        <div 
                            key={index}
                            className="pricing-card"
                            style={{ '--card-color': tier.color }}
                        >
                            <div className="card-header">
                                <h3>{tier.name}</h3>
                                <p>{tier.description}</p>
                                <div className="price-box">
                                    <div className="price-usd">
                                        USD{tier.priceUSD}/month
                                    </div>
                                    <div className="price-inr">
                                        INR{tier.priceINR}/month
                                    </div>
                                </div>
                            </div>

                            <div className="features-list">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className="feature-item">
                                        <FiCheck className="check-icon" />
                                        <div className="feature-text">
                                            <div className="feature-name">{feature.name}</div>
                                            <div className="feature-detail">{feature.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pricing-card-cta">
                                <button 
                                    className="cta-button"
                                    style={{ 
                                        background: tier.name === "Freeloader" 
                                            ? 'var(--freeloader-gradient)' 
                                            : tier.name === "Hustler" 
                                                ? 'var(--hustler-gradient)' 
                                                : 'var(--trailblazer-gradient)'
                                    }}
                                >
                                    {tier.name === "Freeloader" ? "Get Started Free" : "Choose Plan"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;