import React, { memo, useState, useEffect } from "react";
import { Container } from "./container";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, ArrowRight, CheckCircle2, CheckCheck, Clock, Users, Database } from "lucide-react";
import { Link } from "react-router-dom";

// Enhanced decorative wave component with brighter purple colors
const GradientWave = memo(() => (
  <div className="absolute top-0 left-0 right-0 transform -translate-y-full h-40 overflow-hidden">
    <svg
      viewBox="0 0 1440 320"
      className="absolute bottom-0 w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="footerGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(147, 51, 234, 0.25)" />
          <stop offset="50%" stopColor="rgba(79, 70, 229, 0.2)" />
          <stop offset="100%" stopColor="rgba(147, 51, 234, 0.25)" />
        </linearGradient>
        <linearGradient id="footerGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(79, 70, 229, 0.15)" />
          <stop offset="50%" stopColor="rgba(147, 51, 234, 0.12)" />
          <stop offset="100%" stopColor="rgba(79, 70, 229, 0.15)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#footerGradient1)"
        d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
      <path
        fill="url(#footerGradient2)"
        d="M0,192L60,202.7C120,213,240,235,360,234.7C480,235,600,213,720,181.3C840,149,960,107,1080,106.7C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        opacity="0.8"
      ></path>
    </svg>
  </div>
));

// Purple wave background to match reference image
const PurpleWaveBackground = memo(() => (
  <div className="absolute top-0 left-0 right-0 w-full">
    <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-transparent h-32 opacity-70"></div>
    <svg 
      className="w-full h-auto" 
      viewBox="0 0 1440 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: "translateY(-99%)" }}
    >
      <path 
        d="M0,128L80,117.3C160,107,320,85,480,96C640,107,800,149,960,165.3C1120,181,1280,171,1360,165.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" 
        fill="url(#purpleWaveGradient)"
      />
      <defs>
        <linearGradient id="purpleWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(233, 213, 255, 0.8)" />
          <stop offset="50%" stopColor="rgba(216, 180, 254, 0.6)" />
          <stop offset="100%" stopColor="rgba(233, 213, 255, 0.8)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
));

// Live Transaction Component with enhanced contrast
const LiveTransactions = memo(() => {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-md overflow-hidden">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Live Activity
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">Account Created</p>
            <p className="text-xs text-gray-500">Maria S.</p>
          </div>
          <div className="text-xs text-gray-400">Just now</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">Account Created</p>
            <p className="text-xs text-gray-500">Alex T.</p>
          </div>
          <div className="text-xs text-gray-400">10s ago</div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
          <span>10+ active users</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>System operational</span>
        </div>
      </div>
    </div>
  );
});

// Newsletter subscription component with brighter background
const NewsletterSubscription = memo(() => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would actually submit the email to your newsletter service
    setEmail("");
  };

  return (
    <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        Stay updated with QuizGen
      </h3>
      <p className="text-sm text-gray-600 mb-5">
        Get the latest news, product updates, and educational tips delivered to your inbox
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm"
        >
          <span>Subscribe</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </form>
    </div>
  );
});

// Extract navigation links to avoid re-creation on render
const navigation = {
  product: [
    { name: "Create Quiz", href: "/quiz-generator" },
    { name: "PDF Q&A", href: "/pdf-qa" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api" },
    { name: "Support", href: "/support" },
    { name: "FAQs", href: "/faqs" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

// Define types for the navigation items
interface NavigationItem {
  name: string;
  href: string;
}

// Define props interface for the NavigationSection component
interface NavigationSectionProps {
  title: string;
  items: NavigationItem[];
}

// Enhanced memoized navigation section with stronger visual elements
const NavigationSection = memo(({ title, items }: NavigationSectionProps) => (
  <div className="relative">
    <h3 className="text-sm font-semibold text-gray-900 after:content-[''] after:block after:w-12 after:h-1 after:bg-gradient-to-r after:from-purple-600 after:to-indigo-600 after:mt-2">{title}</h3>
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            to={item.href}
            className="text-sm text-gray-700 hover:text-purple-700 transition-colors flex items-center group"
          >
            <span className="h-1.5 w-0 bg-purple-600 rounded mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
));

// Enhanced memoized contact information section with brighter icons
const ContactInfo = memo(() => (
  <div className="mt-6 space-y-4">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
        <Mail className="h-4 w-4 text-purple-600" />
      </div>
      <a href="mailto:contact@quizgen.ai" className="text-sm text-gray-700 hover:text-purple-700 transition-colors">
        contact@quizgen.ai
      </a>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
        <Phone className="h-4 w-4 text-purple-600" />
      </div>
      <a href="tel:+1-555-123-4567" className="text-sm text-gray-700 hover:text-purple-700 transition-colors">
        +1 (555) 123-4567
      </a>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
        <MapPin className="h-4 w-4 text-purple-600" />
      </div>
      <span className="text-sm text-gray-700">
        San Francisco, CA 94103
      </span>
    </div>
  </div>
));

// Enhanced memoized social links component with brighter colors
const SocialLinks = memo(() => (
  <div className="mt-6 flex space-x-3">
    <a
      href="https://github.com/quizgen"
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 hover:-translate-y-1 hover:shadow-md"
      aria-label="GitHub"
    >
      <Github className="h-4 w-4 text-gray-700" />
    </a>
    <a
      href="https://twitter.com/quizgen"
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 hover:-translate-y-1 hover:shadow-md"
      aria-label="Twitter"
    >
      <Twitter className="h-4 w-4 text-gray-700" />
    </a>
    <a
      href="https://linkedin.com/company/quizgen"
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 hover:-translate-y-1 hover:shadow-md"
      aria-label="LinkedIn"
    >
      <Linkedin className="h-4 w-4 text-gray-700" />
    </a>
  </div>
));

// Advanced RGB Grid background element with animation and increased visibility
const RGBGridBackground = memo(() => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => (prev + 1) % 360);
    }, 50); // Update animation frame
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid pattern with RGB color cycling */}
      <div className="absolute -top-24 -right-20 w-[700px] h-[700px] opacity-30">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="rgbGrid1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`hsl(${time}, 100%, 50%)`} />
              <stop offset="50%" stopColor={`hsl(${(time + 120) % 360}, 100%, 50%)`} />
              <stop offset="100%" stopColor={`hsl(${(time + 240) % 360}, 100%, 50%)`} />
            </linearGradient>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="url(#rgbGrid1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Animated circles with increased visibility */}
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full border-2" 
           style={{ borderColor: `hsl(${(time + 60) % 360}, 100%, 50%)`, opacity: 0.15 }}>
      </div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full border-2"
           style={{ borderColor: `hsl(${(time + 180) % 360}, 100%, 50%)`, opacity: 0.15 }}>
      </div>
      
      {/* Larger floating dots for better visibility */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full animate-ping" 
           style={{ background: `hsl(${time}, 100%, 50%)`, opacity: 0.4, animationDuration: '3s' }}>
      </div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full animate-ping" 
           style={{ background: `hsl(${(time + 120) % 360}, 100%, 50%)`, opacity: 0.4, animationDuration: '4s' }}>
      </div>
      <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full animate-ping" 
           style={{ background: `hsl(${(time + 240) % 360}, 100%, 50%)`, opacity: 0.4, animationDuration: '2.5s' }}>
      </div>
    </div>
  );
});

// Main Footer component, memoized to prevent unnecessary re-renders
export const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white relative mt-32">
      <PurpleWaveBackground />
      <GradientWave />
      
      {/* Footer Content */}
      <div className="border-t border-gray-100 relative z-10 overflow-hidden">
        <RGBGridBackground />
        <Container className="relative">
          <div className="relative pt-20 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-x-8 gap-y-12">
              <div className="md:col-span-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <span className="text-white font-bold text-2xl">Q</span>
                  </div>
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">QuizGen</span>
                </div>
                <p className="mt-4 text-sm text-gray-700 max-w-md leading-relaxed">
                  Transform your learning experience with AI-powered quizzes and intelligent PDF analysis. Join thousands of educators and students worldwide.
                </p>
                <ContactInfo />
                <SocialLinks />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <LiveTransactions />
                  <NewsletterSubscription />
                </div>
              </div>
              <div className="md:col-span-1"></div>
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                <NavigationSection title="Product" items={navigation.product} />
                <NavigationSection title="Company" items={navigation.company} />
                <div>
                  <div className="flex flex-col space-y-8">
                    <NavigationSection title="Resources" items={navigation.resources} />
                    <NavigationSection title="Legal" items={navigation.legal} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                  © {currentYear} QuizGen. All rights reserved.
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  Made with <span className="text-red-500 mx-1">❤️</span> for educators and learners worldwide
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
});
