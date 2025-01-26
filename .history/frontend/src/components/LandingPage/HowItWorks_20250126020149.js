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
            title: 'Connect Your Store',
            description: 'Seamlessly integrate your e-commerce platform with SelloVate.'
        },
        {
            step: '02',
            title: 'Import Products',
            description: 'Automatically sync your product catalog and inventory data.'
        },
        {
            step: '03',
            title: 'Optimize Listings',
            description: 'Let AI enhance your product listings for maximum visibility.'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="hyperspeed-background">
                <Hyperspeed effectOptions={hyperspeedPresets.cyberpunk} />
            </div>
            <div className="content-wrapper">
                <motion.h2
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="section-title"
                >
                    How SelloVate Works
                </motion.h2>
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