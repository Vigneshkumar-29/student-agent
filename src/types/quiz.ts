export interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  date: string;
  score: number;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  articleTitle?: string;
  questions?: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

export interface QuizAnalytics {
  totalQuizzes: number;
  averageScore: number;
  totalTimeSpent: number;
  bestScore: number;
  worstScore: number;
  averageTimePerQuiz: number;
}
