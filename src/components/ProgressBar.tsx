import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  currentQuestion?: number;
  totalQuestions?: number;
}

const ProgressBar = ({
  currentQuestion = 1,
  totalQuestions = 5,
}: ProgressBarProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 animate-pulse" />
    </div>
  );
};

export default ProgressBar;
