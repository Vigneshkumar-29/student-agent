import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizResults from '@/components/QuizResults';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

const QuizResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state;

  // If no results data is present, show error state
  if (!quizData?.correctAnswers || !quizData?.totalQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <Card className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No quiz results found. Please complete a quiz to see your results.
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => navigate('/quiz-generator')}>
                Take a Quiz
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    navigate('/quiz-generator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <QuizResults
          correctAnswers={quizData.correctAnswers}
          totalQuestions={quizData.totalQuestions}
          timeSpent={quizData.timeSpent || 0}
          onRetry={handleRetry}
          streak={quizData.streak}
          bestStreak={quizData.bestStreak}
        />
      </div>
    </div>
  );
};

export default QuizResultsPage; 