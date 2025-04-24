import React, { useState, useEffect } from "react";
import ArticleInput from "@/components/quiz/ArticleInput";
import QuizInterface from "@/components/quiz/QuizInterface";
import QuizResults from "@/components/QuizResults";
import { generateQuizQuestions } from "@/lib/openai";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Download,
  FileDown,
  History,
  X,
  Clock,
  Trophy,
  Trash2,
  Calendar,
  Search,
  Filter,
  SortAsc,
  Share2,
  DownloadCloud,
  FileText,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { useAuth } from "@/contexts/AuthContext";
import { QuizQuestion } from "@/types/quiz";
import { supabase, quizOperations } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from '@/types/supabase';

type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
type SortOption = 'date' | 'score' | 'questions';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

const QuizGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [articleText, setArticleText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuizResults, setCurrentQuizResults] = useState<{
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    score: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterScore, setFilterScore] = useState<FilterOption>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const navigate = useNavigate();
  const { addQuizAttempt } = useQuiz();
  const { user } = useAuth();

  useEffect(() => {
    if (showHistory) {
      loadQuizHistory();
    }
  }, [showHistory]);

  const loadQuizHistory = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to view quiz history",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingHistory(true);
    try {
      const history = await quizOperations.getQuizHistory(user.id);
      setQuizHistory(history);
      console.log('Loaded quiz history:', history);
    } catch (error) {
      console.error("Error loading quiz history:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load quiz history",
        variant: "destructive",
      });
      setQuizHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (!user) return;
    try {
      await quizOperations.deleteQuiz(quizId, user.id);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      await loadQuizHistory();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const validateArticle = (text: string) => {
    if (text.trim().length === 0) {
      throw new Error("Please provide some text or upload a PDF to generate questions.");
    }
    if (text.trim().length < 100) {
      throw new Error("Please provide a longer article (at least 100 characters) for better quiz generation.");
    }
    return text;
  };

  const handleArticleSubmit = async (text: string, questionCount: number) => {
    setIsGenerating(true);
    setError(null);
    setQuizStarted(false);
    setQuestions([]);
    setGenerationProgress(25);
    setShowResults(false);
    setCurrentQuizResults(null);
    
    try {
      const userText = validateArticle(text);
      setArticleText(userText);
      
      const trimmedText = userText.length > 10000 
        ? userText.substring(0, 10000) + "... [text trimmed due to length]" 
        : userText;
      
      setGenerationProgress(50);
      
      const generatedQuestions = await generateQuizQuestions(trimmedText, questionCount);
      console.log("Generated questions:", generatedQuestions);
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions were generated. Please try again with a different article.");
      }
      
      setQuestions(generatedQuestions);
      setGenerationProgress(100);
      setQuizStarted(true);
      console.log("Quiz started with questions:", generatedQuestions.length);
      
    } catch (error) {
      console.error("Error generating quiz:", error);
      
      let errorMessage = "Failed to generate quiz.";
      if (error instanceof Error) {
        if (error.message.includes("JSON")) {
          errorMessage = "Failed to generate quiz due to a formatting error. Please try again or use a different article.";
        } else if (error.message.includes("API")) {
          errorMessage = "Failed to connect to the quiz generator service. Please check your internet connection and try again.";
        } else {
          errorMessage = `Failed to generate quiz: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setQuizStarted(false);
      setQuestions([]);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleQuizComplete = async (
    results: Array<{ questionId: string; isCorrect: boolean }>,
    timeSpent: number,
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to save quiz results",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate results first
      const correctAnswers = results.filter((r) => r.isCorrect).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Set results in state immediately for user feedback
      setCurrentQuizResults({
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent,
        score
      });
      setShowResults(true);

      // Format questions with user answers
      const questionsWithAnswers = questions.map((q, index) => ({
        id: q.id,
        text: q.text,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text
        })),
        correctAnswerId: q.correctAnswerId,
        userAnswer: results[index]?.questionId || null,
        isCorrect: results[index]?.isCorrect || false
      }));

      // Create quiz data for saving
      const quizData = {
        article_title: articleText.substring(0, 100).trim() || "Untitled Quiz",
        score,
        time_spent: Math.round(timeSpent),
        total_questions: questions.length,
        correct_answers: correctAnswers,
        questions: questionsWithAnswers
      };

      // Save quiz attempt
      const savedQuiz = await quizOperations.saveQuizAttempt(quizData, user.id);
      
      if (savedQuiz) {
        // Update quiz context
        await addQuizAttempt(savedQuiz);
        
        // Refresh history if it's being shown
        if (showHistory) {
          await loadQuizHistory();
        }

        toast({
          title: "Success!",
          description: "Quiz results saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      toast({
        title: "Warning",
        description: error instanceof Error ? error.message : "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTryAnotherQuiz = () => {
    // Reset all quiz-related states
    setShowResults(false);
    setCurrentQuizResults(null);
    setQuizStarted(false);
    setQuestions([]);
    setArticleText("");
    setError(null);
    setGenerationProgress(0);
    
    // Refresh history to ensure it's up to date
    if (showHistory) {
      loadQuizHistory();
    }
    
    // Clear any selected quiz
    setSelectedQuiz(null);
    
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
        title: "Ready!",
        description: "You can now start a new quiz.",
    });
  };

  const shareQuiz = async (quiz: QuizAttempt) => {
    if (!quiz) {
        toast({
            title: "Error",
            description: "No quiz data available to share",
            variant: "destructive",
        });
        return;
    }

    const shareText = `I scored ${quiz.score}% on my quiz about "${quiz.article_title}"! Try it yourself!`;
    const shareUrl = `${window.location.origin}/quiz-generator`;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Quiz Results',
                text: shareText,
                url: shareUrl,
            });
        } else {
            const shareContent = `${shareText}\n\nTake your own quiz at: ${shareUrl}`;
            await navigator.clipboard.writeText(shareContent);
            toast({
                title: "Success",
                description: "Share text copied to clipboard!",
            });
        }
    } catch (error) {
        console.error('Error sharing quiz:', error);
        if (error instanceof Error && error.name === 'AbortError') {
            // User cancelled sharing - no need to show error
            return;
        }
        // Fallback to clipboard copy if sharing fails
        try {
            const shareContent = `${shareText}\n\nTake your own quiz at: ${shareUrl}`;
            await navigator.clipboard.writeText(shareContent);
            toast({
                title: "Success",
                description: "Share text copied to clipboard instead!",
            });
        } catch (clipboardError) {
            toast({
                title: "Error",
                description: "Could not share quiz results",
                variant: "destructive",
            });
        }
    }
  };

  const downloadQuiz = (quiz: QuizAttempt) => {
    if (!quiz || !quiz.questions) {
        toast({
            title: "Error",
            description: "Quiz data is not available for download",
            variant: "destructive",
        });
        return;
    }

    try {
        const content = `
Quiz Results Summary
------------------
Title: ${quiz.article_title}
Date: ${format(new Date(quiz.created_at), 'PPP')}
Score: ${quiz.score}%
Time Spent: ${Math.floor(quiz.time_spent / 60)}m ${quiz.time_spent % 60}s
Questions Correct: ${quiz.correct_answers}/${quiz.total_questions}

Detailed Questions and Answers:
${(quiz.questions as any[]).map((q, i) => `
Question ${i + 1}: ${q.question}

Options:
${q.options.map((opt: any, j: number) => `${String.fromCharCode(65 + j)}. ${opt.text}`).join('\n')}

Your Answer: ${q.userAnswer ? String.fromCharCode(65 + q.options.findIndex((opt: any) => opt.id === q.userAnswer)) : 'Not answered'}
Correct Answer: ${String.fromCharCode(65 + q.options.findIndex((opt: any) => opt.id === q.correctAnswerId))}
Result: ${q.userAnswer === q.correctAnswerId ? '✓ Correct' : '✗ Incorrect'}
${q.explanation ? `\nExplanation: ${q.explanation}` : ''}
`).join('\n-------------------\n')}

Summary:
- Total Questions: ${quiz.total_questions}
- Correct Answers: ${quiz.correct_answers}
- Final Score: ${quiz.score}%
- Time Taken: ${Math.floor(quiz.time_spent / 60)}m ${quiz.time_spent % 60}s
`.trim();

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz_results_${format(new Date(quiz.created_at), 'yyyy-MM-dd')}.txt`;
        
        // Append, click, and cleanup
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
            description: "Failed to download quiz results. Please try again.",
            variant: "destructive",
        });
    }
  };

  const filteredQuizzes = quizHistory
    .filter(quiz => {
      const matchesSearch = quiz.article_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScore = filterScore === 'all' ||
        (filterScore === 'high' && quiz.score >= 80) ||
        (filterScore === 'medium' && quiz.score >= 60 && quiz.score < 80) ||
        (filterScore === 'low' && quiz.score < 60);
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'questions':
          return b.total_questions - a.total_questions;
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900">
      {/* Professional header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/tools')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-xl">AI Quiz Generator</h1>
              <p className="text-xs text-purple-200">Transform text into engaging quizzes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/10"
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Quiz History
            </Button>
          </div>
        </div>
      </div>
      
      <Container className="py-8">
        {!quizStarted && !showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Generate a Custom Quiz</h2>
                <p className="text-gray-600">
                  Paste your article or upload a document to create an AI-powered quiz instantly
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <ArticleInput onSubmit={handleArticleSubmit} isLoading={isGenerating} />
                
                {isGenerating && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">Generating your custom quiz...</p>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        ) : null}

        {quizStarted && !showResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <QuizInterface
              questions={questions}
              onQuizComplete={handleQuizComplete}
            />
          </motion.div>
        ) : null}

        {showResults && currentQuizResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <QuizResults
              correctAnswers={currentQuizResults.correctAnswers}
              totalQuestions={currentQuizResults.totalQuestions}
              timeSpent={currentQuizResults.timeSpent}
              onRetry={handleTryAnotherQuiz}
            />
          </motion.div>
        ) : null}
      </Container>

      {/* Quiz History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold">
              <History className="mr-2 h-5 w-5 text-purple-600" />
              Quiz History
            </DialogTitle>
            <DialogDescription>
              Review your past quiz attempts and performance
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between bg-slate-50 p-3 rounded-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={sortBy} onValueChange={val => setSortBy(val as SortOption)}>
                  <SelectTrigger className="w-36 text-sm h-9">
                    <SortAsc className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (newest)</SelectItem>
                    <SelectItem value="score">Highest Score</SelectItem>
                    <SelectItem value="questions">Most Questions</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterScore} onValueChange={val => setFilterScore(val as FilterOption)}>
                  <SelectTrigger className="w-36 text-sm h-9">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                    <SelectItem value="low">Low (0-49%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="space-y-4 mt-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredQuizzes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="bg-slate-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No quiz history found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {quizHistory.length > 0
                        ? "Try adjusting your search or filters"
                        : "Complete your first quiz to see it here"}
                    </p>
                    {quizHistory.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSortBy('date');
                          setFilterScore('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 mt-2">
                    {filteredQuizzes.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-wrap gap-2 justify-between items-start">
                          <div className="max-w-lg">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {quiz.article_title || "Untitled Quiz"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(quiz.created_at), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center">
                                <Trophy className="h-3.5 w-3.5 mr-1" />
                                {quiz.correct_answers} of {quiz.total_questions} correct
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {Math.floor(quiz.time_spent / 60)}:{(quiz.time_spent % 60)
                                  .toString()
                                  .padStart(2, "0")} min
                              </div>
                            </div>
                          </div>
                          
                          <Badge
                            className={getScoreColor(quiz.score)}
                          >
                            {quiz.score}% Score
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => downloadQuiz(quiz)}
                          >
                            <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
                            Download
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => shareQuiz(quiz)}
                          >
                            <Share2 className="h-3.5 w-3.5 mr-1.5" />
                            Share
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedQuiz) {
                  handleDelete(selectedQuiz.id);
                  setShowDeleteDialog(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizGenerator;
