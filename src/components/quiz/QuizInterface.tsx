import React, { useState, useEffect, useCallback } from "react";
import QuestionCard from "./QuestionCard";
import ProgressBar from "../ProgressBar";
import QuizResults from "../QuizResults";
import { Timer, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import ConfettiOverlay from "./ConfettiOverlay";
import { Alert, AlertDescription } from "../ui/alert";

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
}

interface QuizInterfaceProps {
  questions?: Question[];
  onQuizComplete?: (
    results: Array<{ questionId: string; isCorrect: boolean }>,
    timeSpent: number,
  ) => void;
}

const QuizInterface = ({
  questions = [],
  onQuizComplete = () => {},
}: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; isCorrect: boolean }>
  >([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [autoAdvanceTimeout, setAutoAdvanceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
  } | null>(null);

  // Reset auto-advance when changing questions
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isComplete) {
        setTimeSpent((prev) => {
          // Show warning at 5 minutes and every 2 minutes after
          if (prev > 0 && prev % 300 === 0) {
            setTimeWarning(true);
            setTimeout(() => setTimeWarning(false), 5000); // Hide warning after 5 seconds
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    if (isAnswered || isExiting) return;

    const currentOptions = questions[currentQuestionIndex]?.options || [];
    
    if (e.key >= "1" && e.key <= String(currentOptions.length)) {
      const index = parseInt(e.key) - 1;
      handleAnswerSelected(currentOptions[index].id);
    } else if (e.key === "Enter" && selectedAnswerId) {
      handleAnswerSelected(selectedAnswerId);
    }
  }, [currentQuestionIndex, isAnswered, selectedAnswerId, isExiting, questions]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => window.removeEventListener("keydown", handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  const handleAnswerSelected = (answerId: string) => {
    if (!currentQuestion || isAnswered || isExiting) return;

    setSelectedAnswerId(answerId);
    setIsAnswered(true);

    const isCorrect = answerId === currentQuestion.correctAnswerId;
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, isCorrect },
    ];
    setAnswers(newAnswers);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    // Set timeout for auto-advance
    const timeout = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerId("");
        setIsAnswered(false);
        setTimeWarning(false);
      } else {
        const finalAnswers = newAnswers;
        const finalTimeSpent = timeSpent;
        
        // Calculate results
        const correctCount = finalAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctCount / questions.length) * 100);
        
        // Set results first
        setQuizResults({
          score,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          timeSpent: finalTimeSpent
        });
        
        // Then set complete state
        setIsComplete(true);
        
        // Call completion handler with complete data
        onQuizComplete(finalAnswers, finalTimeSpent);
      }
    }, 1500);

    setAutoAdvanceTimeout(timeout);
  };

  const handleExitConfirmation = () => {
    setIsExiting(true);
    if (window.confirm("Are you sure you want to exit? Your progress will be saved.")) {
      onQuizComplete(answers, timeSpent);
    } else {
      setIsExiting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!questions?.length || !currentQuestion) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No questions available. Please try generating the quiz again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isComplete && quizResults) {
    return (
      <QuizResults
        correctAnswers={quizResults.correctAnswers}
        totalQuestions={quizResults.totalQuestions}
        timeSpent={quizResults.timeSpent}
        onRetry={() => {
          setIsComplete(false);
          setQuizResults(null);
          onQuizComplete(answers, timeSpent);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showConfetti && <ConfettiOverlay show={showConfetti} />}

      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900"
          onClick={handleExitConfirmation}
          disabled={isExiting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Quiz
        </Button>
        <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
          <Timer className={`w-4 h-4 ${timeWarning ? "text-amber-500 animate-pulse" : ""}`} />
          <span className={`font-medium ${timeWarning ? "text-amber-500" : ""}`}>
            {Math.floor(timeSpent / 60)}:
            {(timeSpent % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {timeWarning && (
        <Alert variant="warning" className="mb-4 animate-fadeIn">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've been on this quiz for {Math.floor(timeSpent / 60)} minutes. Consider picking up the pace!
          </AlertDescription>
        </Alert>
      )}

      <ProgressBar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="relative">
        <QuestionCard
          question={currentQuestion.text}
          options={currentQuestion.options}
          correctAnswerId={currentQuestion.correctAnswerId}
          onAnswerSelected={handleAnswerSelected}
          isAnswered={isAnswered}
          selectedAnswerId={selectedAnswerId}
        />
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>Click on an answer or use number keys (1-{currentQuestion.options.length}) to select</p>
        <p className="mt-1">
          Question {currentQuestionIndex + 1} of {questions.length}
          {isAnswered && " • Advancing to next question..."}
        </p>
      </div>
    </div>
  );
};

export default QuizInterface;
