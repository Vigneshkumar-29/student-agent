import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Award, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface StudentPerformanceCardProps {
  quizzes: any[];
  pdfAnalyses: any[];
  imageAnalyses: any[];
  isLoading: boolean;
}

const StudentPerformanceCard: React.FC<StudentPerformanceCardProps> = ({
  quizzes,
  pdfAnalyses,
  imageAnalyses,
  isLoading
}) => {
  // Calculate average quiz score
  const avgScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / quizzes.length) 
    : 0;
  
  // Calculate total time spent across all tools
  const totalTimeSpent = [
    ...quizzes.map(q => q.time_spent || 0),
    ...pdfAnalyses.map(p => p.time_spent || 0),
    ...imageAnalyses.map(i => i.time_spent || 0)
  ].reduce((acc, time) => acc + time, 0);
  
  // Format time as hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Calculate learning strengths based on quiz subjects
  const subjectScores = quizzes.reduce((acc, quiz) => {
    if (!quiz.subject) return acc;
    if (!acc[quiz.subject]) {
      acc[quiz.subject] = { total: 0, count: 0 };
    }
    acc[quiz.subject].total += quiz.score || 0;
    acc[quiz.subject].count += 1;
    return acc;
  }, {} as Record<string, {total: number, count: number}>);
  
  // Convert to array and sort by average score
  const strengths = Object.entries(subjectScores)
    .map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.total / data.count)
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
  
  // Calculate recent improvement (compare recent quizzes with older ones)
  const sortedQuizzes = [...quizzes].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const recentQuizzes = sortedQuizzes.slice(0, Math.ceil(sortedQuizzes.length / 2));
  const olderQuizzes = sortedQuizzes.slice(Math.ceil(sortedQuizzes.length / 2));
  
  const recentAvg = recentQuizzes.length > 0
    ? recentQuizzes.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / recentQuizzes.length
    : 0;
    
  const olderAvg = olderQuizzes.length > 0
    ? olderQuizzes.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / olderQuizzes.length
    : 0;
    
  const improvement = olderAvg > 0 
    ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) 
    : 0;
  
  // Calculate performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Requires Attention";
  };
  
  const performanceLevel = getPerformanceLevel(avgScore);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Brain className="h-5 w-5 mr-2 text-indigo-600" />
          Student Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No performance data yet</p>
            <p className="text-sm">Complete quizzes and use learning tools to see your performance metrics</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Overall Performance */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Overall Performance</h3>
                <Badge 
                  className={`
                    ${avgScore >= 80 ? 'bg-green-100 text-green-800' : 
                     avgScore >= 60 ? 'bg-blue-100 text-blue-800' : 
                     'bg-orange-100 text-orange-800'}
                  `}
                >
                  {performanceLevel}
                </Badge>
              </div>
              <div className="flex items-center mt-2">
                <Award className="h-8 w-8 text-indigo-600 mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-sm font-semibold">{avgScore}%</span>
                  </div>
                  <Progress value={avgScore} className="h-2" />
                </div>
              </div>
            </div>
            
            {/* Learning Engagement */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3">Learning Engagement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Total Time Spent</p>
                    <p className="font-semibold">{formatTime(totalTimeSpent)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Quizzes Completed</p>
                    <p className="font-semibold">{quizzes.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Learning Strengths */}
            {strengths.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Learning Strengths</h3>
                <div className="space-y-3">
                  {strengths.slice(0, 3).map((strength, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`
                        w-2 h-10 rounded-full mr-3
                        ${index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-blue-500' : 'bg-purple-500'}
                      `} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{strength.subject}</span>
                          <span className="text-sm font-semibold">{strength.avgScore}%</span>
                        </div>
                        <Progress value={strength.avgScore} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Improvement */}
            {recentQuizzes.length > 0 && olderQuizzes.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Progress Tracking</h3>
                <div className="flex items-center">
                  <TrendingUp className={`h-8 w-8 mr-3 ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="text-sm">Recent performance compared to earlier results</p>
                    <p className={`font-semibold text-lg ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {improvement >= 0 ? '+' : ''}{improvement}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Recent Avg.</p>
                    <p className="font-medium">{Math.round(recentAvg)}%</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Previous Avg.</p>
                    <p className="font-medium">{Math.round(olderAvg)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceCard; 