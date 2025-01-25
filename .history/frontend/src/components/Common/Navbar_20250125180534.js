import { useState, useEffect } from 'react';
import StarBorder from './StarBorder';
import './Navbar.css';

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
                <StarBorder 
                    as="button" 
                    className="nav-logo" 
                    color="#3b82f6" 
                    speed="8s"
                    onClick={() => scrollToSection('hero')}
                >
                    Sellovate
                </StarBorder>

                <div className="nav-links">
                    <StarBorder 
                        as="button" 
                        className="nav-link"
                        color="#3b82f6" 
                        speed="5s"
                        onClick={() => scrollToSection('features')}
                    >
                        Features
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        className="nav-link"
                        color="#3b82f6" 
                        speed="5s"
                        onClick={() => scrollToSection('pricing')}
                    >
                        Pricing
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        className="nav-link"
                        color="#3b82f6" 
                        speed="5s"
                        onClick={() => scrollToSection('about')}
                    >
                        About
                    </StarBorder>

                    <StarBorder 
                        as="button" 
                        className="nav-link"
                        color="#3b82f6" 
                        speed="5s"
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