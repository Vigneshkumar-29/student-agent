import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Timer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "./ui/use-toast";
import QuizResults from "./QuizResults";
import ProgressBar from "./quiz/ProgressBar";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";

interface QuizInterfaceProps {
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctAnswerId: string;
  }>;
  onQuizComplete: (answers: Array<{ questionId: string; isCorrect: boolean }>, timeSpent: number) => void;
}

const QuizInterface = ({ questions, onQuizComplete }: QuizInterfaceProps) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; isCorrect: boolean }>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
  } | null>(null);

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isQuizComplete) {
        setTimeSpent((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizComplete]);

  const handleAnswer = async (answerId: string) => {
    if (isAnswered || isQuizComplete || isLoading) return;
    
    setSelectedAnswerId(answerId);
    setIsAnswered(true);

    const isCorrect = answerId === currentQuestion.correctAnswerId;
    const answer = { questionId: currentQuestion.id, isCorrect };
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerId("");
      setIsAnswered(false);
      setIsLoading(false);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = (finalAnswers: Array<{ questionId: string; isCorrect: boolean }>) => {
    setIsQuizComplete(true);
    const correctAnswers = finalAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    setQuizResults({
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent
    });
    
    onQuizComplete(finalAnswers, timeSpent);
  };

  const handleExit = () => {
    if (!isQuizComplete && answers.length > 0) {
      setShowExitConfirm(true);
    } else {
      navigate("/quiz-generator");
    }
  };

  const handleExitConfirm = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
      navigate("/quiz-generator");
    }
    setShowExitConfirm(false);
  };

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

  if (isQuizComplete && quizResults) {
    return (
      <QuizResults
        correctAnswers={quizResults.correctAnswers}
        totalQuestions={quizResults.totalQuestions}
        timeSpent={quizResults.timeSpent}
        onRetry={() => {
          navigate('/quiz-generator');
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <Button
          variant="ghost"
          onClick={handleExit}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          disabled={isQuizComplete || isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Quiz
        </Button>
        <div className="flex items-center text-gray-600 bg-purple-50 px-4 py-2 rounded-lg">
          <Timer className="w-4 h-4 mr-2 text-purple-600" />
          <span className="font-semibold text-purple-600">
            {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
          </span>
        </div>
      </div>

      <ProgressBar progress={progress} />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <p className="text-lg text-gray-700 mb-6">{currentQuestion.text}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={isAnswered || isLoading}
              variant={selectedAnswerId === option.id ? "default" : "outline"}
              className={`w-full justify-start p-4 text-left ${
                isAnswered
                  ? option.id === currentQuestion.correctAnswerId
                    ? "bg-green-50 border-green-200 text-green-700"
                    : option.id === selectedAnswerId
                    ? "bg-red-50 border-red-200 text-red-700"
                    : ""
                  : ""
              }`}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
