import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, X } from "lucide-react";
import { CheckCircle2, XCircle } from 'lucide-react';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctAnswerId: string;
  };
  selectedAnswerId: string;
  onAnswer: (answerId: string) => void;
  isAnswered: boolean;
  disabled: boolean;
}

const QuestionCard = ({
  question,
  selectedAnswerId,
  onAnswer,
  isAnswered,
  disabled,
}: QuestionCardProps) => {
  const isCorrect = isAnswered && selectedAnswerId === question.correctAnswerId;
  const isIncorrect = isAnswered && selectedAnswerId !== question.correctAnswerId;

  const handleAnswerClick = (answerId: string) => {
    if (isAnswered) return;
    onAnswer(answerId);

    if (answerId === question.correctAnswerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <Card className="w-full p-8 bg-white shadow-lg border-0 rounded-xl transition-all">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <motion.h2 
            className="text-2xl font-semibold text-gray-800 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {question.text}
          </motion.h2>

          <div className="grid gap-3">
            <AnimatePresence mode="wait">
              {question.options.map((option) => {
                const isSelected = selectedAnswerId === option.id;
                const isCorrectAnswer = option.id === question.correctAnswerId;
                
                let buttonClass = "w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 ";
                
                if (!isAnswered) {
                  buttonClass += "border-gray-200 hover:border-purple-400 hover:bg-purple-50/50";
                } else if (isCorrectAnswer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700";
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 opacity-50";
                }

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: option.id.charCodeAt(0) * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className={buttonClass}
                      onClick={() => !isAnswered && !disabled && handleAnswerClick(option.id)}
                      disabled={isAnswered || disabled}
                    >
          <div className="space-y-3">
            {options.map((option) => (
              <motion.div
                key={option.id}
                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                className="relative"
              >
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left p-4 h-auto ${getOptionClassName(option.id)} transition-all duration-200`}
                  onClick={() => handleAnswerClick(option.id)}
                  disabled={isAnswered}
                >
                  <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm">
                    {String.fromCharCode(65 + (parseInt(option.id) - 1))}
                  </span>
                  {option.text}
                  {isAnswered && option.id === correctAnswerId && (
                    <Check className="ml-auto h-5 w-5 text-green-500" />
                  )}
                  {isAnswered &&
                    option.id === selectedAnswerId &&
                    option.id !== correctAnswerId && (
                      <X className="ml-auto h-5 w-5 text-red-500" />
                    )}
                </Button>
              </motion.div>
            ))}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg ${selectedAnswerId === correctAnswerId ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              <p className="text-sm font-medium">
                {selectedAnswerId === correctAnswerId
                  ? "✨ Correct!"
                  : "❌ Incorrect"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default QuestionCard;
