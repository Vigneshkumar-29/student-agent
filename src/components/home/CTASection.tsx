import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CTASectionProps {
  containerVariants: any;
  itemVariants: any;
}

export const CTASection: React.FC<CTASectionProps> = ({
  containerVariants,
  itemVariants,
}) => {
  const navigate = useNavigate();

  return (
    <Container className="mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative rounded-xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        <div className="relative z-10 px-8 py-16 text-center">
          <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="text-base font-semibold">Start Learning Today</span>
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Transform Your Learning Journey
              <span className="block mt-2 text-purple-100">
                With AI-Powered Tools
              </span>
            </h2>
            
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Join thousands of learners who are already experiencing the future of education with QuizGen's intelligent learning platform.
            </p>
            
            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => navigate('/tools')}
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-white text-indigo-600 rounded-lg shadow-md"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/tools')}
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold border border-white/40 text-white rounded-lg hover:bg-white/10"
              >
                Explore Tools
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}; 