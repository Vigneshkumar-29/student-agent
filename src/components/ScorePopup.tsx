import React from 'react';
import { Trophy, Home, RefreshCcw, History, Share } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface ScorePopupProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  onClose: () => void;
  onRetry: () => void;
}

const ScorePopup = ({
  score,
  correctAnswers,
  totalQuestions,
  timeSpent,
  onClose,
  onRetry,
}: ScorePopupProps) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (score >= 70) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const runAnimation = () => {
        const timeLeft = animationEnd - Date.now();
        const particleCount = 50;

        confetti({
          particleCount,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#6366f1', '#2563eb', '#4f46e5'],
          ticks: 300,
          gravity: 1.2,
          scalar: randomInRange(0.4, 1)
        });

        if (timeLeft > 0) {
          requestAnimationFrame(runAnimation);
        }
      };

      runAnimation();
    }
  }, [score]);

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Exceptional! You\'re a master of this topic! 🌟';
    if (score >= 80) return 'Outstanding performance! Keep shining! ✨';
    if (score >= 70) return 'Great work! You\'re making excellent progress! 🎯';
    if (score >= 60) return 'Good effort! Keep pushing forward! 💪';
    return 'Keep practicing! Every attempt makes you stronger! 🌱';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-violet-500 to-purple-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ease-out animate-slideUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-br ${getScoreGradient(score)} rounded-full p-5 shadow-lg animate-bounce`}>
          <Trophy className="w-9 h-9 text-white" />
        </div>

        <div className="text-center mt-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Quiz Complete!
          </h2>
          <p className="text-gray-600 text-lg mb-6">{getScoreMessage(score)}</p>
          
          <div className={`text-7xl font-bold mb-6 bg-gradient-to-r ${getScoreGradient(score)} bg-clip-text text-transparent transition-colors duration-300`}>
            {score}%
            <span className="text-3xl ml-2 text-gray-400">{getGrade(score)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-gray-500">Correct Answers</div>
              <div className="text-2xl font-bold text-indigo-600">
                {correctAnswers}/{totalQuestions}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-gray-500">Time Taken</div>
              <div className="text-2xl font-bold text-indigo-600">
                {formatTime(timeSpent)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] rounded-xl py-6"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Try Another Quiz
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-purple-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-xl py-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => navigate('/?view=history')}
                variant="outline"
                className="border-purple-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-xl py-6"
              >
                <History className="w-5 h-5 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePopup; 