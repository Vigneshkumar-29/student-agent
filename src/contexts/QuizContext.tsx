import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { quizOperations } from "@/lib/supabase";

interface QuizContextType {
  quizHistory: any[];
  analytics: {
    averageScore: number;
    totalQuizzes: number;
    bestScore: number;
  };
  addQuizAttempt: (attempt: any) => Promise<void>;
  clearHistory: () => Promise<void>;
  fetchQuizHistory: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    averageScore: 0,
    totalQuizzes: 0,
    bestScore: 0,
  });
  const { user } = useAuth();

  const fetchQuizHistory = async () => {
    try {
      if (!user) {
        setQuizHistory([]);
        return;
      }

      const data = await quizOperations.getQuizHistory(user.id);
      if (data) {
        setQuizHistory(data);
        // Update analytics
        const scores = data.map((attempt: any) => attempt.score);
        setAnalytics({
          averageScore: scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0,
          totalQuizzes: scores.length,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        });
      } else {
        setQuizHistory([]);
      }
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      setQuizHistory([]);
    }
  };

  const addQuizAttempt = async (attempt: any) => {
    try {
      if (!user) return;

      const newAttempt = await quizOperations.saveQuizAttempt(attempt, user.id);
      if (newAttempt) {
        setQuizHistory((prev) => [...prev, newAttempt]);
        // Update analytics
        const scores = [...quizHistory, newAttempt].map((a) => a.score);
        setAnalytics({
          averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          totalQuizzes: scores.length,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        });
      }
    } catch (error) {
      console.error("Error adding quiz attempt:", error);
    }
  };

  const clearHistory = async () => {
    try {
      if (!user) return;

      await quizOperations.clearQuizHistory(user.id);
      setQuizHistory([]);
      setAnalytics({
        averageScore: 0,
        totalQuizzes: 0,
        bestScore: 0,
      });
    } catch (error) {
      console.error("Error clearing quiz history:", error);
    }
  };

  useEffect(() => {
    fetchQuizHistory();
  }, [user]);

  return (
    <QuizContext.Provider
      value={{
        quizHistory,
        analytics,
        addQuizAttempt,
        clearHistory,
        fetchQuizHistory,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
