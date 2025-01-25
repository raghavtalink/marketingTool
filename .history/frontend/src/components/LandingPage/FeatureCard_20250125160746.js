import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const FeatureCard = ({ feature, index }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        cardRef.current.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(10px)
        `;
        
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        setIsHovered(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
        >
            <div
                ref={cardRef}
                className="feature-card-combined"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
            >
                <div className="feature-content">
                    <div className="icon-wrapper">
                        {feature.icon}
                        <div className="icon-background"></div>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                </div>
                <div className="card-effects">
                    <div className="gradient-bg"></div>
                    <div className="spotlight-overlay"></div>
                    <div className="pixel-grid"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default FeatureCard;