import { useRef, useEffect } from 'react';
import './FeatureCard.css';

const FeatureCard = ({ feature, index }) => {
    const cardRef = useRef(null);
    const canvasRef = useRef(null);
    const pixelsRef = useRef([]);

    // Spotlight effect
    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            className="feature-card-combined"
            onMouseMove={handleMouseMove}
        >
            <div className="feature-content">
                <div className="icon-wrapper">
                    {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
            </div>
            <div className="card-effects">
                <div className="pixel-overlay"></div>
                <div className="spotlight-overlay"></div>
            </div>
        </div>
    );
};

export default FeatureCard;