import React from "react";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Star, Lightbulb, Target, Trophy } from "lucide-react";

interface BenefitsSectionProps {
  containerVariants: any;
  itemVariants: any;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  containerVariants,
  itemVariants,
}) => {
  const benefits = [
    {
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      title: "Enhanced Understanding",
      description: "Deepen your comprehension through interactive quizzes and targeted questions"
    },
    {
      icon: <Target className="h-5 w-5 text-rose-500" />,
      title: "Focused Learning",
      description: "Zero in on key concepts with AI-generated questions that matter"
    },
    {
      icon: <Trophy className="h-5 w-5 text-emerald-500" />,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and insights"
    }
  ];

  return (
    <Container className="mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
            <Star className="h-4 w-4 mr-2" />
            Why Choose QuizGen
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How QuizGen Helps You Learn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform adapts to your learning style and helps you achieve better results
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center p-8 rounded-xl bg-white shadow-md border border-indigo-100/20"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <div className="w-8 h-8 text-purple-600">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </Container>
  );
}; 