import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Layout, Settings, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Hide footer on specific pages
  const excludedPages = [
    "/", "/about", "/blog", 
    "/tools", "/quiz-generator", "/pdf-qa", 
    "/dashboard", "/image-qa"
  ];
  
  if (excludedPages.includes(location.pathname)) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 to-white border-t border-gray-200 shadow-lg py-3 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Link 
            to="/" 
            className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-purple-600' : 'text-gray-600'} hover:text-purple-500 transition-colors`}
          >
            <Home strokeWidth={1.5} size={22} />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>
          
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center p-2 ${isActive('/dashboard') ? 'text-purple-600' : 'text-gray-600'} hover:text-purple-500 transition-colors`}
          >
            <Layout strokeWidth={1.5} size={22} />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to="/quiz-generator" 
            className={`flex flex-col items-center p-2 ${isActive('/quiz-generator') ? 'text-purple-600' : 'text-gray-600'} hover:text-purple-500 transition-colors relative group`}
          >
            <div className="absolute -top-3 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-purple-200 transition-shadow">
              <BookOpen size={18} className="text-white" />
            </div>
            <div className="mt-8">
              <span className="text-xs font-medium">Quiz</span>
            </div>
          </Link>
          
          <Link 
            to="/tools" 
            className={`flex flex-col items-center p-2 ${isActive('/tools') ? 'text-purple-600' : 'text-gray-600'} hover:text-purple-500 transition-colors`}
          >
            <Settings strokeWidth={1.5} size={22} />
            <span className="text-xs mt-1 font-medium">Tools</span>
          </Link>
          
          <Link 
            to="/support" 
            className={`flex flex-col items-center p-2 ${isActive('/support') ? 'text-purple-600' : 'text-gray-600'} hover:text-purple-500 transition-colors`}
          >
            <HelpCircle strokeWidth={1.5} size={22} />
            <span className="text-xs mt-1 font-medium">Help</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 