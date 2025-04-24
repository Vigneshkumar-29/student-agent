import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  containerVariants: any;
  itemVariants: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  containerVariants,
  itemVariants,
}) => {
  const navigate = useNavigate();

  return (
    <Container className="relative text-center mb-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 space-y-8"
      >
        <motion.div 
          variants={itemVariants} 
          className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-indigo-200/50"
        >
          <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">AI-Powered Learning Assistant</span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="text-5xl md:text-6xl font-bold tracking-tight mb-8 mx-auto max-w-4xl"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
            Your Personal Learning
            <br />
            AI Assistant
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants} 
          className="text-xl font-medium text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          QuizGen is your intelligent learning companion that transforms any text or PDF into interactive quizzes, provides instant answers to your questions, and helps you learn more effectively with AI-powered tools.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate('/tools')}
            className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all duration-300"
          >
            <span>View Our Tools</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Simplified decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      </div>
    </Container>
  );
}; 