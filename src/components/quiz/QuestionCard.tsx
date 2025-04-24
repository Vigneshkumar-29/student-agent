import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  question?: string;
  options?: Option[];
  correctAnswerId?: string;
  onAnswerSelected?: (answerId: string) => void;
  isAnswered?: boolean;
  selectedAnswerId?: string;
  explanation?: string;
}

const QuestionCard = ({
  question = "Sample question",
  options = [],
  correctAnswerId = "",
  onAnswerSelected = () => {},
  isAnswered = false,
  selectedAnswerId = "",
  explanation = "",
}: QuestionCardProps) => {
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);

  const handleAnswerClick = (answerId: string) => {
    if (isAnswered) return;
    onAnswerSelected(answerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAnswerClick(optionId);
    }
  };

  const getOptionClassName = (optionId: string) => {
    const baseClasses = "relative flex items-center transition-all duration-200 border-2 rounded-lg";
    const hoverClasses = !isAnswered ? "hover:bg-purple-50 hover:border-purple-500 hover:shadow-md cursor-pointer" : "";
    const correctClasses = "bg-green-50 border-green-500 text-green-700 shadow-green-100";
    const incorrectClasses = "bg-red-50 border-red-500 text-red-700 shadow-red-100";
    const selectedClasses = !isAnswered && optionId === selectedAnswerId ? "bg-purple-50 border-purple-500 text-purple-700" : "";
    const disabledClasses = "opacity-70 cursor-not-allowed";

    if (!isAnswered) {
      return cn(baseClasses, hoverClasses, selectedClasses);
    }
    if (optionId === correctAnswerId) {
      return cn(baseClasses, correctClasses);
    }
    if (optionId === selectedAnswerId && optionId !== correctAnswerId) {
      return cn(baseClasses, incorrectClasses);
    }
    return cn(baseClasses, disabledClasses);
  };

  return (
    <Card className="w-full p-8 bg-white shadow-lg border-0 rounded-xl transition-all">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {question}
          </h2>

          <div 
            className="space-y-4"
            role="radiogroup"
            aria-label="Question options"
          >
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                className="relative"
                onFocus={() => setFocusedOptionIndex(index)}
                onBlur={() => setFocusedOptionIndex(-1)}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left p-6 h-auto",
                    getOptionClassName(option.id),
                    focusedOptionIndex === index && "ring-2 ring-offset-2 ring-purple-500"
                  )}
                  onClick={() => handleAnswerClick(option.id)}
                  onKeyDown={(e) => handleKeyDown(e, option.id)}
                  disabled={isAnswered}
                  role="radio"
                  aria-checked={selectedAnswerId === option.id}
                  tabIndex={0}
                >
                  <div className="flex items-center w-full">
                    <span 
                      className={cn(
                        "mr-4 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold",
                        selectedAnswerId === option.id ? "bg-purple-100 border-purple-500 text-purple-700" : "border-gray-300",
                        focusedOptionIndex === index && "border-purple-500"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-grow text-base">{option.text}</span>
                    {isAnswered && option.id === correctAnswerId && (
                      <Check className="ml-4 h-6 w-6 text-green-500 shrink-0" aria-label="Correct answer" />
                    )}
                    {isAnswered &&
                      option.id === selectedAnswerId &&
                      option.id !== correctAnswerId && (
                        <X className="ml-4 h-6 w-6 text-red-500 shrink-0" aria-label="Incorrect answer" />
                      )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div 
                className={cn(
                  "p-4 rounded-lg",
                  selectedAnswerId === correctAnswerId 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                )}
              >
                <p className="text-sm font-medium">
                  {selectedAnswerId === correctAnswerId 
                    ? "Correct! Well done!" 
                    : "Incorrect. The correct answer was option " + 
                      String.fromCharCode(65 + options.findIndex(opt => opt.id === correctAnswerId))}
                </p>
                {explanation && (
                  <p className="mt-2 text-sm">{explanation}</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default QuestionCard;
