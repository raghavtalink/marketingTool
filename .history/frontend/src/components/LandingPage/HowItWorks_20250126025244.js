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
            step: '01',
            title: 'Struggling with Sales?',
            description: "You've got amazing products, but they're buried in the noise. Countless hours spent writing listings, guessing prices, and still not seeing the sales you deserve."
        },
        {
            step: '02',
            title: 'Discover SelloVate',
            description: 'Enter your product details once, and watch as our AI suite transforms your entire e-commerce presence. No more late nights writing descriptions or wondering about pricing.'
        },
        {
            step: '03',
            title: 'Supercharge Your Listings',
            description: 'Our AI Content Generator crafts SEO-optimized titles, compelling descriptions, and converts browsers into buyers. It's like having a professional copywriter, SEO expert, and marketing team at your fingertips.'
        },
        {
            step: '04',
            title: 'Smart Product Bundling',
            description: 'Discover hidden opportunities with our AI Combo Analyzer. It identifies perfect product pairings that boost average order value and customer satisfaction. Your customers get more value, you get more sales.'
        },
        {
            step: '05',
            title: 'AI Customer Support & Insights',
            description: 'Our AI chatbot becomes your 24/7 product expert, answering customer questions instantly while gathering valuable insights about what your customers really want.'
        },
        {
            step: '06',
            title: 'Perfect Pricing Strategy',
            description: 'Stop guessing your prices. Our AI analyzes market data, competition, and demand patterns to suggest optimal pricing that maximizes both sales and profits.'
        },
        {
            step: '07',
            title: 'Professional Product Imagery',
            description: 'Transform basic product photos into stunning professional shots with our AI Studio. Create lifestyle images, banners, and social media graphics that catch eyes and stop scrollers.'
        },
        {
            step: '08',
            title: 'Market Intelligence',
            description: 'Stay ahead of trends and competition with real-time market analysis. Know what's selling, why it's selling, and how to position your products for maximum success.'
        },
        {
            step: '09',
            title: 'Smart Marketing Campaigns',
            description: 'Launch targeted social media campaigns and promotions designed by AI to reach your ideal customers. Every ad, every post, optimized for engagement and conversions.'
        },
        {
            step: '10',
            title: 'Watch Your Sales Soar',
            description: 'Experience the transformation as optimized listings, perfect pricing, stunning visuals, and smart marketing combine to dramatically increase your sales volume.'
        }
    ];

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