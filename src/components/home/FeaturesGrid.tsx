import React from "react";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { BookOpen, FileQuestion, Image, Brain } from "lucide-react";

interface FeaturesGridProps {
  containerVariants: any;
  itemVariants: any;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  containerVariants,
  itemVariants,
}) => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      title: "AI-Powered Quiz Creation",
      description: "Transform any text into engaging quizzes instantly. Perfect for students, teachers, and self-learners."
    },
    {
      icon: <FileQuestion className="h-6 w-6 text-indigo-600" />,
      title: "Smart PDF Assistant",
      description: "Upload your study materials and get instant answers to any question. Makes learning efficient and interactive."
    },
    {
      icon: <Image className="h-6 w-6 text-emerald-600" />,
      title: "Visual Learning Support",
      description: "Learn from images with our AI analysis tool. Perfect for diagrams, charts, and visual content."
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      title: "Adaptive Learning Path",
      description: "Experience personalized learning that adapts to your pace and knowledge level in real-time."
    }
  ];

  return (
    <Container className="mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100/50"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}; 