import { useState, useEffect } from 'react';
import StarBorder from './StarBorder';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-content">
                <StarBorder as="div" className="logo-container" color="#3b82f6" speed="8s">
                    <span className="logo">Sellovate</span>
                </StarBorder>

                <div className="nav-links">
                    <StarBorder 
                        as="button" 
                        color="#3b82f6" 
                        speed="5s"
                        onClick={() => scrollToSection('features')}
                    >
                        Features
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        color="#8b5cf6" 
                        speed="6s"
                        onClick={() => scrollToSection('pricing')}
                    >
                        Pricing
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        color="#6366f1" 
                        speed="7s"
                        onClick={() => scrollToSection('about')}
                    >
                        About
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        className="contact-btn"
                        color="#ec4899" 
                        speed="4s"
                        onClick={() => scrollToSection('contact')}
                    >
                        Contact
                    </StarBorder>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;