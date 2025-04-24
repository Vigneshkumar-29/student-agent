import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
            <Link to="/dashboard" className={isActive('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/quiz-generator" className={isActive('/quiz-generator')}>
              Quiz Generator
            </Link>
            <Link to="/notes" className={isActive('/notes')}>
              Notes
            </Link>
            <Link to="/tools" className={isActive('/tools')}>
              Tools
            </Link>
            <Link to="/blog" className={isActive('/blog')}>
              Blog
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.email}
                </span>
                <Link
                  to="/login"
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 