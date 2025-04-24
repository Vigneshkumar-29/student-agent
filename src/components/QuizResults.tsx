import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, RotateCcw, Share, Download } from "lucide-react";
import confetti from 'canvas-confetti';
import QuizStats from "./quiz/QuizStats";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "./ui/use-toast";

interface QuizResultsProps {
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  onRetry?: () => void;
  streak?: number;
  bestStreak?: number;
}

const QuizResults = ({
  correctAnswers = 0,
  totalQuestions = 0,
  timeSpent = 0,
  onRetry,
  streak = 0,
  bestStreak = 0,
}: QuizResultsProps) => {
  const navigate = useNavigate();
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const averageTimePerQuestion = timeSpent / totalQuestions;

  React.useEffect(() => {
    if (score >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#818CF8', '#6366F1', '#4F46E5'],
      });
    }
  }, [score]);

  const getScoreGrade = () => {
    if (score >= 90) return { grade: "A+", color: "text-green-500" };
    if (score >= 80) return { grade: "A", color: "text-green-500" };
    if (score >= 70) return { grade: "B", color: "text-blue-500" };
    if (score >= 60) return { grade: "C", color: "text-yellow-500" };
    if (score >= 50) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/quiz-generator');
    }
  };

  const handleShare = async () => {
    const shareText = `I scored ${score}% (${correctAnswers}/${totalQuestions}) on my quiz! Try it yourself!`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Quiz Results',
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        toast({
          title: "Success",
          description: "Share link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to share quiz",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      const content = `
Quiz Results Summary
------------------
Score: ${score}%
Questions Correct: ${correctAnswers}/${totalQuestions}
Time Spent: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s
Grade: ${getScoreGrade().grade}
Average Time per Question: ${Math.round(averageTimePerQuestion)}s
${streak > 0 ? `Current Streak: ${streak}` : ''}
${bestStreak > streak ? `Best Streak: ${bestStreak}` : ''}
`.trim();

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz_results_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Quiz results downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading quiz:', error);
      toast({
        title: "Error",
        description: "Failed to download quiz results",
        variant: "destructive",
      });
    }
  };

  const { grade, color } = getScoreGrade();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6 p-4"
    >
      <Card className="p-8 bg-white shadow-lg border-0 rounded-xl">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative inline-block"
          >
            <Trophy className={`w-20 h-20 ${color}`} />
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <div className={`text-2xl font-bold ${color} bg-white rounded-full px-3 py-1 shadow-lg`}>
                {grade}
              </div>
            </div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900">Quiz Complete!</h2>
          <p className="text-xl text-gray-600">
            {score >= 90
              ? "🌟 Outstanding! You're a master!"
              : score >= 70
              ? "👏 Great job! Keep it up!"
              : score >= 50
              ? "💪 Good effort! Room for improvement."
              : "📚 Keep practicing, you'll get there!"}
          </p>
        </div>

        <div className="mt-8">
          <QuizStats
            totalQuestions={totalQuestions}
            correctAnswers={correctAnswers}
            timeSpent={timeSpent}
            averageTimePerQuestion={averageTimePerQuestion}
            streak={streak}
            bestStreak={bestStreak}
          />
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleRetry}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Try Another Quiz
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Share className="w-5 h-5" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </Button>
          </div>
        </div>

        <p className="text-sm text-center text-gray-500 mt-6">
          Challenge yourself with another quiz to improve your knowledge!
          {streak > 0 && (
            <span className="block mt-1">
              🔥 Current streak: {streak} quizzes
              {bestStreak > streak && ` (Best: ${bestStreak})`}
            </span>
          )}
        </p>
      </Card>
    </motion.div>
  );
};

export default QuizResults;
