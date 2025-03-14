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
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full md:w-auto md:top-8 md:left-18 md:right-18 flex items-center justify-between px-4 md:px-6 lg:px-20 h-[4.5rem] bg-black text-white transition-all duration-300 ${
          isScrolled ? "shadow-lg shadow-white/30 md:rounded-b-xl" : "md:rounded-2xl"
        }`}
      >
        <nav className="container mx-auto flex items-center justify-between w-full">
          <div className="flex items-center">
            <span onClick={()=>navigate("/")} className="text-xl font-bold cursor-pointer">SELLOVATE</span>
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
            <button 
              className="bg-black text-white px-4 py-2 border border-white rounded-md text-md font-semibold hover:bg-gray-900"
              onClick={handleLoginClick}
            >
              SIGN IN
            </button>
            <button 
              className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold flex items-center hover:bg-gray-200"
              onClick={handleRegisterClick}
            >
              REGISTER
            </button>
          </div>

          <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu - positioned below the navbar */}
      {isOpen && (
        <div className="lg:hidden fixed top-[4.5rem] left-0 right-0 z-40 bg-black border-t border-gray-800 px-4 py-4 w-full shadow-lg shadow-black/50 transition-all duration-300 overflow-hidden">
          <ul className="flex flex-col space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block py-2 text-center text-sm font-semibold text-white hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col space-y-3 mt-4">
            <button 
              className="bg-transparent text-white py-2 border border-white rounded-md text-sm font-semibold hover:bg-gray-900"
              onClick={() => {
                setIsOpen(false);
                navigate('/login');
              }}
            >
              SIGN IN
            </button>
            <button 
              className="bg-white text-black py-2 rounded-md text-sm font-semibold flex items-center justify-center hover:bg-gray-200"
              onClick={() => {
                setIsOpen(false);
                navigate('/register');
              }}
            >
              REGISTER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}