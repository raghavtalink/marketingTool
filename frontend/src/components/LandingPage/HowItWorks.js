import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Hyperspeed from './Hyperspeed/Hyperspeed';
import './HowItWorks.css';
import { hyperspeedPresets } from './Hyperspeed/presets';

const TimelineItem = ({ step, title, description, delay }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2
    });

    return (
        <motion.div
            ref={ref}
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay }}
        >
            <div className="timeline-step">{step}</div>
            <div className="timeline-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </motion.div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            "step": "01",
            "title": "Discover Sellovate",
            "description": "You’re tired of low sales, poor product visibility, and countless hours spent on marketing efforts with little to show for it. That’s when you find Sellovate—the AI-powered solution designed to turn your struggles into success."
        },
        {
            "step": "02",
            "title": "Add Your Product",
            "description": "Start by adding your product details into Sellovate’s intuitive dashboard. No need for technical skills—simply enter your product name, description, and category. Sellovate takes care of the rest."
        },
        {
            "step": "03",
            "title": "Optimize Listings with AI Content Generator",
            "description": "Struggling to write catchy titles or SEO-friendly descriptions? Sellovate’s AI Content Generator creates expert-level titles, descriptions, keywords, and even full product listings, crafted to attract more buyers and boost visibility."
        },
        {
            "step": "04",
            "title": "Explore Winning Combinations with AI Combo Analyzer",
            "description": "Ever wondered which products sell better together? Sellovate analyzes trends and suggests combos that maximize your sales potential, helping you bundle products for increased profits."
        },
        {
            "step": "05",
            "title": "Get Insights with AI Chatbot",
            "description": "Need clarity or ideas about your product’s performance? Sellovate’s AI chatbot is your 24/7 assistant, answering questions, providing insights, and helping you make data-driven decisions effortlessly."
        },
        {
            "step": "06",
            "title": "Decide Smart Pricing with AI Pricing Decider",
            "description": "Stop guessing! Sellovate’s AI Pricing Decider analyzes market trends, competitor pricing, and your costs to recommend the perfect price point that balances competitiveness and profitability."
        },
        {
            "step": "07",
            "title": "Create Stunning Visuals with AI Image Tool",
            "description": "Turn your product into a visual masterpiece. With Sellovate’s image creation tool, you can design studio-like photos and graphics that look professional and captivating—perfect for social media and e-commerce listings."
        },
        {
            "step": "08",
            "title": "Stay Ahead with Market Trends and Competitor Analysis",
            "description": "Stay one step ahead of the competition. Sellovate’s AI scans the market to uncover the latest trends and analyzes your competitors’ strategies, giving you actionable insights to refine your game plan."
        },
        {
            "step": "09",
            "title": "Design Smart Campaigns for Maximum Impact",
            "description": "Sellovate doesn’t just help you create—it helps you market. Use AI-powered campaign designs to create engaging social media posts and advertising strategies that connect with your audience and boost sales."
        },
        {
            "step": "10",
            "title": "Watch Your Sales Skyrocket",
            "description": "With Sellovate’s all-in-one tools, you’ll not only save time but also see the tangible results of increased sales, better visibility, and a stronger presence in the competitive e-commerce landscape."
        }
    ]
    ;

    return (
        <section className="how-it-works-section">
            <div className="hyperspeed-background">
                <Hyperspeed effectOptions={{
                    ...hyperspeedPresets.cyberpunk,
                    colors: {
                        roadColor: 0x080808,
                        islandColor: 0x0a0a0a,
                        background: 0x000000,
                        shoulderLines: 0x131318,
                        brokenLines: 0x131318,
                        leftCars: [0x3b82f6, 0x8b5cf6, 0x6d28d9],
                        rightCars: [0x8b5cf6, 0x6d28d9, 0x3b82f6],
                        sticks: 0x3b82f6
                    }
                }} />
            </div>
            <div className="content-wrapper">
                <h2 className="section-title">How SelloVate Works</h2>
                <div className="timeline-container">
                    {steps.map((step, index) => (
                        <TimelineItem
                            key={index}
                            {...step}
                            delay={index * 0.2}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;