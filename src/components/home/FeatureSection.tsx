import React, { memo, useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, LucideIcon, Upload, ZoomIn, RotateCw, MessageSquare, Search, FileQuestion, StickyNote, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeaturePoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface MockupContent {
  uploadZone?: {
    title: string;
    description: string;
    icon: string;
    supportedFormats: string;
    maxSize: string;
  };
  imageDemo?: {
    src: string;
    alt: string;
    tools: string[];
    overlayText: string;
  };
  sampleQuestions?: string[];
}

interface FeatureSectionProps {
  containerVariants: any;
  itemVariants: any;
  title: string;
  gradientText: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  badgeIcon: React.ReactNode;
  badgeText: string;
  badgeColor: string;
  features: FeaturePoint[];
  bgGradient: string;
  buttonGradient: string;
  mockupContent?: MockupContent;
}

// Memo the feature item to prevent unnecessary re-renders
const FeatureItem = memo(({ item, variants }: { item: FeaturePoint, variants: any }) => (
  <motion.li
    variants={variants}
    className="flex items-start space-x-3 bg-white rounded-lg p-3 shadow-sm"
  >
    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
      {item.icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">
        {item.title}
      </h3>
      <p className="text-sm text-gray-600">
        {item.description}
      </p>
    </div>
  </motion.li>
));

// Image upload mockup component
const ImageUploadMockup = memo(({ mockupContent, variants, badgeColor, buttonGradient }: { 
  mockupContent: MockupContent, 
  variants: any,
  badgeColor: string,
  buttonGradient: string
}) => {
  const uploadZone = mockupContent.uploadZone;
  const imageDemo = mockupContent.imageDemo;
  const sampleQuestions = mockupContent.sampleQuestions || [];
  
  // Animation states for the interactive UI elements
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [glowing, setGlowing] = useState(false);
  
  // Determine feature type from button gradient to customize UI
  const isQuizFeature = buttonGradient.includes('purple');
  const isPdfFeature = buttonGradient.includes('blue');
  const isNotesFeature = buttonGradient.includes('amber') || buttonGradient.includes('orange');
  
  // Get theme color for UI accents
  const getThemeColor = () => {
    if (isQuizFeature) return 'purple';
    if (isPdfFeature) return 'blue';
    if (isNotesFeature) return 'amber';
    return 'emerald'; // default for image feature
  };
  
  const themeColor = getThemeColor();
  
  // Cycle through sample questions
  useEffect(() => {
    if (sampleQuestions.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentQuestion(prev => (prev + 1) % sampleQuestions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [sampleQuestions.length]);
  
  // Create pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowing(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (!uploadZone || !imageDemo) return null;

  // Different UI templates for each feature
  const renderFeatureUI = () => {
    if (isQuizFeature) {
      return (
        <div className="relative h-[calc(100%-2.5rem)] flex flex-col">
          {/* Quiz Generator UI */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Quiz header */}
              <div className="bg-purple-50 p-3 border-b border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-purple-800">Quiz Generator</h3>
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-purple-700 shadow-sm">15 Questions</div>
                </div>
                <div className="h-2 w-full bg-white rounded-full shadow-inner overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              {/* Quiz sample content */}
              <div className="flex-1 p-4 overflow-auto bg-white">
                {/* Sample question */}
                <div className="bg-white shadow-sm rounded-lg p-4 mb-3 border border-gray-100 hover:border-purple-200 transition-colors duration-300 hover:shadow-md">
                  <div className="text-sm font-medium text-gray-800 mb-3">What is the primary benefit of using AI for quiz generation?</div>
                  <div className="space-y-2.5">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0 mr-2 bg-purple-100 transition-colors duration-200 hover:border-purple-500 cursor-pointer"></div>
                      <span className="text-sm text-gray-600">Faster creation of learning materials</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-300 flex-shrink-0 mr-2 transition-colors duration-200 hover:border-purple-500 cursor-pointer"></div>
                      <span className="text-sm text-gray-600">Lower quality questions</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex-shrink-0 mr-2 bg-purple-600 transition-colors duration-200 cursor-pointer">
                        <span className="flex items-center justify-center text-white text-[8px]">✓</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">More personalized learning experience</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-purple-500">
                      <span className="font-medium">Correct!</span> AI adapts to learning styles
                    </div>
                    <div className="flex gap-1">
                      <motion.div 
                        className="p-1 rounded hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-5 h-2 bg-purple-500 rounded-full mr-1.5"></div>
                    <div className="w-5 h-2 bg-gray-200 rounded-full mr-1.5"></div>
                    <div className="w-5 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                    AI Generated
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overlay message */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg max-w-[60%] border border-white/50 hover:bg-white/90 transition-all duration-300"
            >
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-purple-100 shadow-sm">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xs text-gray-700 font-medium">{imageDemo.overlayText}</p>
              </div>
            </motion.div>
          </div>
          
          {/* Questions input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex-1 h-9 bg-purple-50 rounded-lg flex items-center px-3 border border-purple-200 shadow-inner hover:bg-white transition-colors duration-300 group">
              <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
                <motion.span
                  key={currentQuestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sampleQuestions[currentQuestion] || "What type of questions to generate..."}
                </motion.span>
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="bg-purple-600 text-white h-9 w-9 p-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      );
    } else if (isPdfFeature) {
      return (
        <div className="relative h-[calc(100%-2.5rem)] flex flex-col">
          {/* PDF Assistant UI */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* PDF sidebar */}
              <div className="w-12 bg-blue-800 flex flex-col items-center py-3 gap-4">
                <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
                  <FileQuestion className="h-4 w-4 text-white/80" />
                </div>
                <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white/80" />
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
                  <Search className="h-4 w-4 text-white/80" />
                </div>
              </div>
              
              {/* PDF content */}
              <div className="flex-1 overflow-hidden relative">
                {/* Page indicator */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-900/80 text-white text-xs py-1 px-3 rounded-full backdrop-blur-sm z-20">
                  Page 15 of 42
                </div>
                
                {/* Subtle light effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 z-10 pointer-events-none"></div>
                <div className={`absolute -inset-full w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 ${glowing ? 'animate-subtle-glow' : ''} pointer-events-none`}></div>
                
                <img 
                  src={imageDemo.src} 
                  alt={imageDemo.alt}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                
                {/* Floating tools */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <motion.div 
                    className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                </div>
                
                {/* Highlights on the PDF */}
                <div className="absolute top-1/3 left-1/4 w-1/3 h-6 bg-yellow-300 opacity-30 rounded animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 w-1/4 h-6 bg-yellow-300 opacity-30 rounded"></div>
                <div className="absolute bottom-1/3 right-1/4 w-1/5 h-6 bg-blue-300 opacity-30 rounded"></div>
                
                {/* Floating note */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute bottom-16 left-6 w-32 h-24 bg-white shadow-lg rounded p-2 rotate-[-4deg] text-xs"
                >
                  <div className="font-medium text-blue-800 border-b border-blue-100 pb-1 mb-1">Note</div>
                  <p className="text-gray-700 text-[9px] leading-tight">Key findings on page 15 highlight the importance of early intervention...</p>
                </motion.div>
                
                {/* Overlay message */}
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg max-w-[60%] border border-white/50 hover:bg-white/90 transition-all duration-300"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-full bg-blue-100 shadow-sm">
                      <FileQuestion className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-700 font-medium">{imageDemo.overlayText}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Question input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex-1 h-9 bg-blue-50 rounded-lg flex items-center px-3 border border-blue-200 shadow-inner hover:bg-white transition-colors duration-300 group">
              <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
                <motion.span
                  key={currentQuestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sampleQuestions[currentQuestion] || "Ask about the document..."}
                </motion.span>
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="bg-blue-600 text-white h-9 w-9 p-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      );
    } else if (isNotesFeature) {
      return (
        <div className="relative h-[calc(100%-2.5rem)] flex flex-col">
          {/* Smart Notes UI */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Notes sidebar */}
              <div className="w-24 bg-gray-50 border-r border-gray-200 py-3 px-2">
                <div className="text-xs font-medium text-amber-700 mb-2">My Notes</div>
                <div className="space-y-2">
                  <div className="bg-white p-2 rounded shadow-sm border border-amber-100">
                    <div className="w-full h-1 bg-amber-400 mb-1.5 rounded-sm"></div>
                    <div className="w-3/4 h-1 bg-gray-200 mb-1.5 rounded-sm"></div>
                    <div className="w-1/2 h-1 bg-gray-200 rounded-sm"></div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded shadow-sm border border-amber-200">
                    <div className="w-full h-1 bg-amber-400 mb-1.5 rounded-sm"></div>
                    <div className="w-3/4 h-1 bg-gray-200 mb-1.5 rounded-sm"></div>
                    <div className="w-1/2 h-1 bg-gray-200 rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              {/* Notes content */}
              <div className="flex-1 overflow-hidden bg-white flex flex-col">
                {/* Toolbar for notes app */}
                <div className="border-b border-gray-200 bg-gray-50 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <div className="text-xs font-medium text-gray-700">Mind Map View</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="p-1 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="p-1 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Mindmap visualization */}
                <div className="relative w-full h-full">
                  <img 
                    src={imageDemo.src} 
                    alt={imageDemo.alt}
                    className="w-full h-full object-cover brightness-[1.05] contrast-[0.95] blur-[0.5px]"
                  />
                  
                  {/* Mind map elements - overlay on top of image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-4/5 h-4/5 max-w-md">
                      {/* Center node */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg flex flex-col items-center justify-center z-20 border-2 border-amber-300 transition-all duration-500 hover:scale-105">
                        <div className="text-xs text-white font-semibold text-center px-2">Main Topic</div>
                        <div className="mt-1 w-10 h-0.5 bg-amber-300 rounded-full"></div>
                      </div>
                      
                      {/* Connected nodes with staggered animations */}
                      <div 
                        className="absolute left-[calc(50%-110px)] top-[calc(50%-60px)] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-md flex items-center justify-center z-10 border border-amber-300 transition-all duration-300 hover:scale-110"
                        style={{animation: "float 3s ease-in-out infinite"}}
                      >
                        <div className="text-xs text-white font-medium text-center">Idea 1</div>
                      </div>
                      
                      <div 
                        className="absolute left-[calc(50%+80px)] top-[calc(50%-90px)] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-md flex items-center justify-center z-10 border border-amber-300 transition-all duration-300 hover:scale-110"
                        style={{animation: "float 3s ease-in-out 0.7s infinite"}}
                      >
                        <div className="text-xs text-white font-medium text-center">Idea 2</div>
                      </div>
                      
                      <div 
                        className="absolute left-[calc(50%+70px)] top-[calc(50%+70px)] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-md flex items-center justify-center z-10 border border-amber-300 transition-all duration-300 hover:scale-110"
                        style={{animation: "float 3s ease-in-out 1.2s infinite"}}
                      >
                        <div className="text-xs text-white font-medium text-center">Idea 3</div>
                      </div>
                      
                      <div 
                        className="absolute left-[calc(50%-120px)] top-[calc(50%+80px)] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-md flex items-center justify-center z-10 border border-amber-300 transition-all duration-300 hover:scale-110"
                        style={{animation: "float 3s ease-in-out 1.7s infinite"}}
                      >
                        <div className="text-xs text-white font-medium text-center">Idea 4</div>
                      </div>
                      
                      {/* Connection lines (SVG) */}
                      <svg className="absolute inset-0 w-full h-full z-0">
                        <line 
                          x1="50%" y1="50%" 
                          x2="calc(50% - 110px)" y2="calc(50% - 60px)" 
                          stroke="rgba(245, 158, 11, 0.5)" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                          className="animate-line-pulse" 
                        />
                        <line 
                          x1="50%" y1="50%" 
                          x2="calc(50% + 80px)" y2="calc(50% - 90px)" 
                          stroke="rgba(245, 158, 11, 0.5)" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                          className="animate-line-pulse" 
                          style={{ animationDelay: "0.5s" }}
                        />
                        <line 
                          x1="50%" y1="50%" 
                          x2="calc(50% + 70px)" y2="calc(50% + 70px)" 
                          stroke="rgba(245, 158, 11, 0.5)" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                          className="animate-line-pulse" 
                          style={{ animationDelay: "1s" }}
                        />
                        <line 
                          x1="50%" y1="50%" 
                          x2="calc(50% - 120px)" y2="calc(50% + 80px)" 
                          stroke="rgba(245, 158, 11, 0.5)" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                          className="animate-line-pulse" 
                          style={{ animationDelay: "1.5s" }}
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Overlay message - redesigned to match reference image */}
                  <div className="absolute bottom-4 right-4 max-w-[60%]">
                    <div className="bg-white rounded-lg shadow-md p-3 flex items-start gap-2 border border-gray-100">
                      <div className="p-1.5 rounded-md bg-amber-100 shadow-sm flex-shrink-0">
                        <StickyNote className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-xs text-gray-700 font-medium">{imageDemo.overlayText}</p>
                    </div>
                    {/* Positioned arrow for the speech bubble */}
                    <div className="w-4 h-4 bg-white rotate-45 absolute right-6 -mt-2 border-t border-l border-gray-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Command input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex-1 h-9 bg-amber-50 rounded-lg flex items-center px-3 border border-amber-200 shadow-inner hover:bg-white transition-colors duration-300 group">
              <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
                <motion.span
                  key={currentQuestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sampleQuestions[currentQuestion] || "Transform your notes..."}
                </motion.span>
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="bg-amber-600 text-white h-9 w-9 p-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      );
    } else {
      // Default image feature UI
      return (
        <div className="relative h-[calc(100%-2.5rem)] flex flex-col">
          {/* Main image */}
          <div className="relative flex-1 overflow-hidden border-b border-gray.200">
            {/* Subtle light effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 z-10 pointer-events-none"></div>
            <div className={`absolute -inset-full w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 ${glowing ? 'animate-subtle-glow' : ''} pointer-events-none`}></div>
            
            <img 
              src={imageDemo.src} 
              alt={imageDemo.alt}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* Floating tools */}
            <div className="absolute top-3 right-3 flex space-x-2">
              <motion.div 
                className={`${badgeColor.replace('text-', 'bg-').replace('bg-', 'text-')} w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 cursor-pointer`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZoomIn className="h-4 w-4" />
              </motion.div>
              <motion.div 
                className={`${badgeColor.replace('text-', 'bg-').replace('bg-', 'text-')} w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 cursor-pointer`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCw className="h-4 w-4" />
              </motion.div>
            </div>
            
            {/* Overlay message */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg max-w-[60%] border border-white/50 hover:bg-white/90 transition-all duration-300"
            >
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-emerald-100 shadow-sm">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-700 font-medium">{imageDemo.overlayText}</p>
              </div>
            </motion.div>
          </div>
          
          {/* Question input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex-1 h-9 bg-gray-50 rounded-lg flex items-center px-3 border border-gray-200 shadow-inner hover:bg-white transition-colors duration-300 group">
              <span className="text-xs text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-300">
                <motion.span
                  key={currentQuestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sampleQuestions[currentQuestion] || "Ask a question..."}
                </motion.span>
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className={`${badgeColor.replace('bg-', '').replace('text-', 'bg-')} text-white h-9 w-9 p-0 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      variants={variants}
      className="hidden lg:block relative h-96 w-full mx-auto"
    >
      <div className="absolute inset-0 bg-white rounded-xl shadow-lg will-change-transform overflow-hidden">
        {/* Header with controls */}
        <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex space-x-2">
            <div className="w-20 h-5 bg-gray-200 rounded-sm"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-sm"></div>
          </div>
        </div>

        {/* Feature-specific UI */}
        {renderFeatureUI()}
      </div>
    </motion.div>
  );
});

// Default mockup for non-image features
const DefaultMockup = memo(({ variants }: { variants: any }) => (
  <motion.div
    variants={variants}
    className="hidden lg:block relative h-96 w-full mx-auto"
  >
    <div className="absolute inset-0 bg-white rounded-xl p-6 shadow-lg will-change-transform">
      <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4" />
      <div className="h-4 w-3/4 bg-blue-200/50 rounded mb-3" />
      <div className="h-4 w-1/2 bg-blue-200/30 rounded mb-3" />
      <div className="h-4 w-2/3 bg-blue-200/30 rounded" />
    </div>
  </motion.div>
));

// Memo the whole component to avoid unnecessary re-renders
export const FeatureSection: React.FC<FeatureSectionProps> = memo(({
  containerVariants,
  itemVariants,
  title,
  gradientText,
  description,
  buttonText,
  buttonLink,
  badgeIcon,
  badgeText,
  badgeColor,
  features,
  bgGradient,
  buttonGradient,
  mockupContent,
}) => {
  const navigate = useNavigate();

  return (
    <Container className="mb-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className={`relative rounded-xl overflow-hidden ${bgGradient} border border-blue-100/50 shadow-lg will-change-transform`}
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${badgeColor}`}>
              {badgeIcon}
              <span className="text-sm font-medium">{badgeText}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {gradientText}
              </span>
            </h2>
            
            <p className="text-lg text-gray-600">
              {description}
            </p>
            
            <ul className="space-y-3">
              {features.map((item, index) => (
                <FeatureItem 
                  key={index}
                  item={item}
                  variants={itemVariants}
                />
              ))}
            </ul>
            
            <Button
              size="lg"
              onClick={() => navigate(buttonLink)}
              className={`${buttonGradient} text-white px-6 py-3 rounded-lg shadow-md`}
            >
              {buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          
          {mockupContent ? (
            <ImageUploadMockup 
              mockupContent={mockupContent} 
              variants={itemVariants}
              badgeColor={badgeColor}
              buttonGradient={buttonGradient}
            />
          ) : (
            <DefaultMockup variants={itemVariants} />
          )}
        </div>
      </motion.div>
    </Container>
  );
}); 