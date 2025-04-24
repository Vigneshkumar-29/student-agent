import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  DownloadCloud,
  Filter,
  Home,
  Search,
  SortAsc,
  Trash2,
  Clock,
  Calendar,
  FileText,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/types/supabase';

type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
type SortOption = 'date' | 'score' | 'questions';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

const QuizLibrary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterScore, setFilterScore] = useState<FilterOption>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadQuizzes();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load quiz history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('id', quizId)
        .eq('user_id', user?.id); // Ensure user can only delete their own quizzes

      if (error) throw error;

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const downloadQuiz = (quiz: QuizAttempt) => {
    try {
      const content = `
Quiz Results
-----------
Title: ${quiz.article_title}
Date: ${format(new Date(quiz.created_at), 'PPP')}
Score: ${quiz.score}%
Time Spent: ${Math.floor(quiz.time_spent / 60)}m ${quiz.time_spent % 60}s
Questions Correct: ${quiz.correct_answers}/${quiz.total_questions}

Questions:
${(quiz.questions as any[]).map((q, i) => `
${i + 1}. ${q.question}
Options:
${q.options.map((opt: any, j: number) => `   ${String.fromCharCode(65 + j)}. ${opt.text}`).join('\n')}
Correct Answer: ${q.options.find((opt: any) => opt.id === q.correctAnswerId)?.text}
${q.userAnswer === q.correctAnswerId ? '✓ Correct' : '✗ Incorrect'}
`).join('\n')}
      `.trim();

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz_${format(new Date(quiz.created_at), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading quiz:', error);
      toast({
        title: "Error",
        description: "Failed to download quiz",
        variant: "destructive",
      });
    }
  };

  const shareQuiz = async (quiz: QuizAttempt) => {
    const shareText = `I scored ${quiz.score}% on my quiz about "${quiz.article_title}"! Try it yourself!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Quiz Results',
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
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

  const filteredQuizzes = quizzes
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

  if (!user) {
    return null; // Protected by PrivateRoute
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30">
      <Header />
      <Container className="py-20">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-white/50"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Quiz Library
          </h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="questions">Questions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterScore} onValueChange={(value: FilterOption) => setFilterScore(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (≥80%)</SelectItem>
                  <SelectItem value="medium">Medium (60-79%)</SelectItem>
                  <SelectItem value="low">Low (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredQuizzes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterScore !== 'all'
                    ? "Try adjusting your search or filters"
                    : "Start taking quizzes to build your library"}
                </p>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 line-clamp-2 mb-2">
                            {quiz.article_title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(quiz.created_at), 'PPP')}
                          </div>
                        </div>
                        <Badge className={getScoreColor(quiz.score)}>
                          {quiz.score}%
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">
                            {quiz.correct_answers}/{quiz.total_questions}
                          </span>
                        </div>
                        <Progress
                          value={(quiz.correct_answers / quiz.total_questions) * 100}
                          className="h-2"
                        />
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.floor(quiz.time_spent / 60)}m {quiz.time_spent % 60}s
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadQuiz(quiz)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareQuiz(quiz)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setShowDeleteDialog(true);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

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
      </Container>
      <Footer />
    </div>
  );
};

export default QuizLibrary; 