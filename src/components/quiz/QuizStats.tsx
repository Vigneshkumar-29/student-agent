import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Brain, Target, Award } from "lucide-react";
import { motion } from "framer-motion";

interface QuizStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  streak: number;
  bestStreak: number;
}

const QuizStats = ({
  totalQuestions,
  correctAnswers,
  timeSpent,
  averageTimePerQuestion,
  streak = 0,
  bestStreak = 0,
}: QuizStatsProps) => {
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const stats = [
    {
      icon: <Target className="w-5 h-5" />,
      label: "Accuracy",
      value: `${score}%`,
      color: getScoreColor(score),
      progress: score,
    },
    {
      icon: <Timer className="w-5 h-5" />,
      label: "Time per Question",
      value: `${Math.round(averageTimePerQuestion)}s`,
      color: "text-blue-500",
      progress: Math.min(100, (30 - averageTimePerQuestion) * 3.33),
    },
    {
      icon: <Brain className="w-5 h-5" />,
      label: "Current Streak",
      value: streak.toString(),
      color: "text-purple-500",
      progress: (streak / 10) * 100,
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: "Best Streak",
      value: bestStreak.toString(),
      color: "text-amber-500",
      progress: (bestStreak / 10) * 100,
    },
  ];

  return (
    <Card className="p-6 bg-white shadow-lg border-0 rounded-xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quiz Statistics</h3>
          <div className="text-sm text-gray-500">
            Time: {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className={`text-lg font-semibold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
            </motion.div>
          ))}
        </div>

        <div className="text-sm text-gray-500 text-center mt-4">
          {score >= 90
            ? "🌟 Outstanding performance!"
            : score >= 70
            ? "👏 Good job!"
            : score >= 50
            ? "💪 Keep practicing!"
            : "📚 More practice needed"}
        </div>
      </div>
    </Card>
  );
};

export default QuizStats; 