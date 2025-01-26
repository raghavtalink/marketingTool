import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Squares from './Squares';
import './HowItWorks.css';

const TimelineItem = ({ step, title, description, delay }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2
    });

    return (
        <motion.div
            ref={ref}
            className="timeline-item"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay }}
        >
            <div className="timeline-card">
                <div className="step-indicator">
                    <div className="step-number">{step}</div>
                    <div className="step-line"></div>
                </div>
                <div className="timeline-content">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <div className="card-glow"></div>
            </div>
        </motion.div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            "step": "01",
            "title": "Discover Sellovate",
            "description": "You're tired of low sales, poor product visibility, and countless hours spent on marketing efforts with little to show for it. That's when you find Sellovate—the AI-powered solution designed to turn your struggles into success."
        },
        {
            "step": "02",
            "title": "Add Your Product",
            "description": "Start by adding your product details into Sellovate's intuitive dashboard. No need for technical skills—simply enter your product name, description, and category. Sellovate takes care of the rest."
        },
        {
            "step": "03",
            "title": "Optimize Listings with AI Content Generator",
            "description": "Struggling to write catchy titles or SEO-friendly descriptions? Sellovate's AI Content Generator creates expert-level titles, descriptions, keywords, and even full product listings, crafted to attract more buyers and boost visibility."
        },
        {
            "step": "04",
            "title": "Explore Winning Combinations with AI Combo Analyzer",
            "description": "Ever wondered which products sell better together? Sellovate analyzes trends and suggests combos that maximize your sales potential, helping you bundle products for increased profits."
        },
        {
            "step": "05",
            "title": "Get Insights with AI Chatbot",
            "description": "Need clarity or ideas about your product's performance? Sellovate's AI chatbot is your 24/7 assistant, answering questions, providing insights, and helping you make data-driven decisions effortlessly."
        },
        {
            "step": "06",
            "title": "Decide Smart Pricing with AI Pricing Decider",
            "description": "Stop guessing! Sellovate's AI Pricing Decider analyzes market trends, competitor pricing, and your costs to recommend the perfect price point that balances competitiveness and profitability."
        },
        {
            "step": "07",
            "title": "Create Stunning Visuals with AI Image Tool",
            "description": "Turn your product into a visual masterpiece. With Sellovate's image creation tool, you can design studio-like photos and graphics that look professional and captivating—perfect for social media and e-commerce listings."
        },
        {
            "step": "08",
            "title": "Stay Ahead with Market Trends and Competitor Analysis",
            "description": "Stay one step ahead of the competition. Sellovate's AI scans the market to uncover the latest trends and analyzes your competitors' strategies, giving you actionable insights to refine your game plan."
        },
        {
            "step": "09",
            "title": "Design Smart Campaigns for Maximum Impact",
            "description": "Sellovate doesn't just help you create—it helps you market. Use AI-powered campaign designs to create engaging social media posts and advertising strategies that connect with your audience and boost sales."
        },
        {
            "step": "10",
            "title": "Watch Your Sales Skyrocket",
            "description": "With Sellovate's all-in-one tools, you'll not only save time but also see the tangible results of increased sales, better visibility, and a stronger presence in the competitive e-commerce landscape."
        }
    ]
    ;

    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    return (
        <section className="how-it-works-section" ref={ref}>
            <div className="hyperspeed-background">
                <Squares 
                    speed={0.3} 
                    squareSize={40}
                    direction='diagonal'
                    borderColor='rgba(59, 130, 246, 0.1)'
                    hoverFillColor='rgba(139, 92, 246, 0.1)'
                />
            </div>
            <motion.div 
                className="content-wrapper"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 1 }}
            >
                <div className="section-header">
                    <motion.h2 
                        className="section-title"
                        initial={{ y: 30, opacity: 0 }}
                        animate={inView ? { y: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        Your Journey to Success
                    </motion.h2>
                    <motion.div 
                        className="title-accent"
                        initial={{ width: 0 }}
                        animate={inView ? { width: '100px' } : {}}
                        transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                </div>
                <div className="timeline-container">
                    {steps.map((step, index) => (
                        <TimelineItem
                            key={index}
                            {...step}
                            delay={index * 0.2}
                        />
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default HowItWorks;