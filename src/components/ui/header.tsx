"use client";

import { Link, useNavigate } from "react-router-dom";
import { Container } from "./container";
import { TubelightNavbar } from "./tubelight-navbar";
import { Button } from "./button";
import { LogOut, Menu, BookOpen, Users, MessageSquare, Settings } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { text: "About", href: "/about" },
    { text: "Contact", href: "/contact" },
    { text: "Blog", href: "/blog" },
    { text: "Tools", href: "/tools" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      {/* Glass effect background with dynamic opacity */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg' 
          : 'bg-white/90 backdrop-blur-xl'
      }`} />
      
      {/* Animated gradient border */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent animate-shimmer" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-5 translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-5 -translate-x-1/2 translate-y-1/2 animate-pulse delay-500" />
      </div>

      <Container className="relative flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-800 to-indigo-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 group-hover:text-purple-800 transition-colors duration-300">
              <span className="relative">
                QuizGen
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-800 to-indigo-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>
            </h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-700 hover:text-purple-800 transition-colors font-medium"
              >
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/logout')}
            className="relative group text-gray-700 hover:text-purple-800 transition-colors font-medium"
          >
            <span className="relative z-10 flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </span>
            <span className="absolute inset-0 bg-purple-100 rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden relative group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700 group-hover:text-purple-800 transition-colors" />
          </Button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 ${
        isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <Container className="py-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-2 text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-all duration-300 font-medium"
              >
                {item.text}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/logout');
                setIsMenuOpen(false);
              }}
              className="w-full justify-start text-gray-700 hover:text-purple-800 hover:bg-purple-50 transition-all duration-300 group font-medium"
            >
              <span className="relative z-10 flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </span>
              <span className="absolute inset-0 bg-purple-100 rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
