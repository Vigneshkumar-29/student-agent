import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase, quizOperations } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Book, Download, Trash2, FileDown, Printer } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useQuiz } from "@/contexts/QuizContext";
import { jsPDF } from "jspdf";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizHistoryItem {
  id: string;
  article_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  created_at: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctAnswerId: string;
    userAnswer?: string;
    isCorrect?: boolean;
  }>;
}

const QuizHistory = () => {
  const [quizHistoryItems, setQuizHistoryItems] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadQuizHistory();
    }
  }, [user]);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizHistoryItems(data || []);
    } catch (error) {
      console.error('Error loading quiz history:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuizAttempt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setQuizHistoryItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Quiz deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive"
      });
    }
  };

  const downloadQuizReport = async (quiz: QuizHistoryItem) => {
    try {
      if (!user) return;

      const { data: quizData, error } = await quizOperations.getQuizDetails(quiz.id, user.id);

      if (error) throw error;

      const doc = new jsPDF();
      const lineHeight = 10;
      let yPos = 20;

      doc.setFontSize(16);
      doc.text('Quiz Report', 20, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(14);
      const title = quiz.article_title || 'Untitled Quiz';
      const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
      doc.text(truncatedTitle, 20, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(12);
      const dateStr = new Date(quiz.created_at).toLocaleDateString();
      doc.text(`Date: ${dateStr}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Score: ${quiz.score}%`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Questions: ${quiz.total_questions}`, 20, yPos);
      yPos += lineHeight * 2;

      if (quizData.questions) {
        doc.setFontSize(14);
        doc.text('Questions & Answers', 20, yPos);
        yPos += lineHeight * 1.5;

        quizData.questions.forEach((question: any, index: number) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.text(`${index + 1}. ${question.text}`, 20, yPos);
          yPos += lineHeight;

          question.options.forEach((option: any, optIndex: number) => {
            const prefix = option.id === question.correctAnswerId ? '✓' : ' ';
            doc.text(`${prefix} ${String.fromCharCode(65 + optIndex)}. ${option.text}`, 30, yPos);
            yPos += lineHeight;
          });

          yPos += lineHeight;
        });
      }

      const fileName = `quiz-${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast({
        title: "Success",
        description: "Quiz report downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading quiz:', error);
      toast({
        title: "Error",
        description: "Failed to download quiz report",
        variant: "destructive",
      });
    }
  };

  const exportHistory = () => {
    const csvContent = [
      [
        "Date",
        "Score",
        "Time Spent",
        "Total Questions",
        "Correct Answers",
        "Article Title",
      ],
      ...quizHistoryItems.map((attempt) => [
        new Date(attempt.created_at).toLocaleDateString(),
        `${attempt.score}%`,
        `${Math.floor(attempt.time_spent / 60)}m ${attempt.time_spent % 60}s`,
        attempt.total_questions,
        attempt.correct_answers,
        attempt.article_title || "Untitled Article",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quiz_history.csv";
    link.click();
  };

  const exportQuizQuestions = (attemptId: string) => {
    const attempt = quizHistoryItems.find((a) => a.id === attemptId);
    if (!attempt || !attempt.questions) return;

    const questionsContent = attempt.questions
      .map((q, index) => {
        const correctOption = q.options.find(
          (opt) => opt.id === q.correctAnswerId,
        );
        return `Question ${index + 1}: ${q.text}\n\nOptions:\n${q.options
          .map(
            (opt) => `${opt.id === q.correctAnswerId ? "✓ " : "  "}${opt.text}`,
          )
          .join("\n")}\n\nCorrect Answer: ${correctOption?.text || ""}\n\n`;
      })
      .join("---\n\n");

    const blob = new Blob([questionsContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `quiz_questions_${new Date(attempt.created_at).toLocaleDateString().replace(/\//g, "-")}.txt`;
    link.click();
  };

  const exportQuizAsPDF = (attemptId: string) => {
    const attempt = quizHistoryItems.find((a) => a.id === attemptId);
    if (!attempt || !attempt.questions) return;

    // Create a printable version of the quiz
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the quiz as PDF");
      return;
    }

    const title = attempt.article_title || "Quiz";
    const date = new Date(attempt.created_at).toLocaleDateString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - Quiz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { text-align: center; color: #4338ca; }
          .meta { text-align: center; color: #666; margin-bottom: 30px; }
          .question { margin-bottom: 30px; }
          .question-text { font-weight: bold; margin-bottom: 10px; }
          .options { margin-left: 20px; }
          .correct { color: #059669; font-weight: bold; }
          .divider { border-top: 1px dashed #ccc; margin: 20px 0; }
          .answer-key { margin-top: 50px; border-top: 2px solid #000; padding-top: 20px; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #4338ca; color: white; border: none; border-radius: 4px; cursor: pointer;">Print/Save as PDF</button>
        </div>
        
        <h1>${title}</h1>
        <div class="meta">Generated on ${date} | ${attempt.total_questions} questions</div>
        
        <div class="questions">
    `);

    // Add questions without answers first
    attempt.questions.forEach((q, index) => {
      printWindow.document.write(`
        <div class="question">
          <div class="question-text">${index + 1}. ${q.text}</div>
          <div class="options">
      `);

      q.options.forEach((opt) => {
        printWindow.document.write(
          `<div>${String.fromCharCode(65 + parseInt(opt.id) - 1)}. ${opt.text}</div>`,
        );
      });

      printWindow.document.write(`
          </div>
        </div>
        ${index < attempt.questions.length - 1 ? '<div class="divider"></div>' : ""}
      `);
    });

    // Add page break and answer key
    printWindow.document.write(`
        </div>
        
        <div class="page-break"></div>
        
        <div class="answer-key">
          <h2>Answer Key</h2>
    `);

    // Add answers
    attempt.questions.forEach((q, index) => {
      const correctOption = q.options.find(
        (opt) => opt.id === q.correctAnswerId,
      );
      const correctLetter = String.fromCharCode(
        65 + parseInt(q.correctAnswerId) - 1,
      );

      printWindow.document.write(`
        <div>${index + 1}. ${correctLetter}. <span class="correct">${correctOption?.text || ""}</span></div>
      `);
    });

    printWindow.document.write(`
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className="p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-700">Please sign in to view your quiz history</h2>
      </div>
    );
  }

  if (quizHistoryItems.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          <Book className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No quiz attempts yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Quiz History</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            disabled={quizHistoryItems.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {}}
            disabled={quizHistoryItems.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
          <p className="text-2xl font-bold">
            {quizHistoryItems.length > 0
              ? (
                  quizHistoryItems.reduce((sum, attempt) => sum + attempt.score, 0) /
                  quizHistoryItems.length
                ).toFixed(1)
              : "0"}
            %
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Quizzes</h3>
          <p className="text-2xl font-bold">{quizHistoryItems.length}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Best Score</h3>
          <p className="text-2xl font-bold">
            {quizHistoryItems.length > 0
              ? Math.max(...quizHistoryItems.map((a) => a.score))
              : "0"}
            %
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizHistoryItems.map((attempt) => (
            <TableRow key={attempt.id}>
              <TableCell>
                {new Date(attempt.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {attempt.article_title || "Untitled Article"}
              </TableCell>
              <TableCell>{attempt.score}%</TableCell>
              <TableCell>
                {Math.floor(attempt.time_spent / 60)}m {attempt.time_spent % 60}s
              </TableCell>
              <TableCell>
                {attempt.correct_answers}/{attempt.total_questions}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportQuizQuestions(attempt.id)}
                    disabled={!attempt.questions}
                    title="Download as text file"
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuizAttempt(attempt.id)}
                    title="Delete quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default QuizHistory;
