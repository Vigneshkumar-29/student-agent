"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useNavigate } from 'react-router-dom';
import { GlowingEffectDemo } from '@/components/ui/glowing-effect-demo';

export function Tools() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 px-4 py-2 text-gray-700 dark:text-gray-300 shadow-md transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg border border-gray-200 dark:border-gray-700 mb-4 md:mb-0"
          >
            <ArrowRight className="h-4 w-4 transform rotate-180 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Back to Home</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center md:text-right bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400">
            AI-Powered Learning Tools
          </h1>
        </div>
        
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our suite of advanced tools designed to enhance your educational experience
          </p>
        </div>

        {/* Interactive Tools Grid */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
              Interactive Learning Suite
            </span>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              All Available Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Click on any tool to get started. Our AI-powered learning tools are designed to help you learn more efficiently.
            </p>
          </div>
          
          <GlowingEffectDemo />
        </div>
      </Container>
    </div>
  );
}

export default Tools; 