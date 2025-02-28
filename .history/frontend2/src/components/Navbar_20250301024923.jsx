import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/pricing", label: "PRICING" },
  { href: "/features", label: "FEATURES" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
  { href: "/contact", label: "CONTACT" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRegisterClick = () => {
    navigate('/register');
    if (isOpen) setIsOpen(false);
  };

  return (
    <header
    className={`fixed top-8 left-18 right-18 z-50 flex items-center justify-between px-6 md:px-20 h-[4.5rem] rounded-2xl   bg-black text-white transition-all duration-300  ${
      isScrolled ? "shadow-lg shadow-white/30 rounded-b-xl" : ""
    }`}
    >
      <nav className="container mx-auto flex items-center justify-between w-full">
        <div className="flex items-center">
          <span className="text-xl font-bold">SELLOVATE</span>
        </div>

        
        <ul className="hidden lg:flex space-x-8 text-md font-semibold">
          {links.map((link) => (
            <li key={link.href}>
              <Link to={link.href} className="hover:underline cursor-pointer">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

      
        <div className="hidden lg:flex space-x-4">
          <button className="bg-black text-white px-4 py-2 border-1 rounded-md text-md font-semibold hover:bg-black-200">
            SIGN IN
          </button>
          <button 
            onClick={handleRegisterClick}
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold flex items-center hover:bg-gray-200"
          >
            <span className=""></span> REGISTER
          </button>
        </div>

      
        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

     
      {isOpen && (
        <div className="lg:hidden bg-black border-t border-gray-800 px-4 pb-4 w-full rounded-lg">
          <ul className="flex flex-col space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block py-2 text-center text-sm font-semibold hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-2 mt-4">
            <button className="bg-white text-black py-2 rounded-md text-sm font-semibold hover:bg-gray-200">
              SIGN IN
            </button>
            <button 
              onClick={handleRegisterClick}
              className="bg-white text-black py-2 rounded-md text-sm font-semibold flex items-center justify-center hover:bg-gray-200"
            >
              <span className="mr-2">⬇</span> REGISTER
            </button>
          </div>
        </div>
      )}
    </header>
  );
}