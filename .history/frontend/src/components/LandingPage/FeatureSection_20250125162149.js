import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeatureSection.css';

gsap.registerPlugin(ScrollTrigger);

const FeatureSection = ({ feature, index, isOdd }) => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        const image = imageRef.current;

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

        gsap.fromTo(image,
            {
                opacity: 0,
                x: isOdd ? 100 : -100
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
    }, [isOdd]);

    return (
        <section ref={sectionRef} className={`feature-section ${isOdd ? 'odd' : 'even'}`}>
            <div className="feature-container">
                <div ref={contentRef} className="feature-content">
                    <div className="icon-wrapper">
                        {feature.icon}
                    </div>
                    <h2>{feature.title}</h2>
                    <p>{feature.description}</p>
                </div>
                <div ref={imageRef} className="feature-visual">
                    <div className="feature-card">
                        <div className="feature-mockup">
                            {/* Custom visual for each feature */}
                            {feature.title === "AI Content Generator" && (
                                <div className="typing-demo">
                                    <div className="code-window">
                                        <div className="window-header">
                                            <span className="dot red"></span>
                                            <span className="dot yellow"></span>
                                            <span className="dot green"></span>
                                        </div>
                                        <div className="typing-text">
                                            Generating content...
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Add similar custom visuals for other features */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;