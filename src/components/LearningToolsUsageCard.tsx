import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Box, 
  FileQuestion, 
  ImageIcon, 
  MessageSquare, 
  BarChart2,
  BookOpen
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface LearningToolsUsageCardProps {
  quizzes: any[];
  pdfAnalyses: any[];
  imageAnalyses: any[];
  pdfChatAnalyses: any[];
  isLoading: boolean;
}

const LearningToolsUsageCard: React.FC<LearningToolsUsageCardProps> = ({
  quizzes,
  pdfAnalyses,
  imageAnalyses,
  pdfChatAnalyses,
  isLoading
}) => {
  // Calculate total usage metrics
  const totalUsage = quizzes.length + pdfAnalyses.length + imageAnalyses.length + pdfChatAnalyses.length;
  
  // Calculate tool usage percentages
  const quizPercentage = totalUsage > 0 ? Math.round((quizzes.length / totalUsage) * 100) : 0;
  const pdfPercentage = totalUsage > 0 ? Math.round((pdfAnalyses.length / totalUsage) * 100) : 0;
  const imagePercentage = totalUsage > 0 ? Math.round((imageAnalyses.length / totalUsage) * 100) : 0;
  const pdfChatPercentage = totalUsage > 0 ? Math.round((pdfChatAnalyses.length / totalUsage) * 100) : 0;
  
  // Sort tools by usage to show preference
  const toolUsage = [
    { 
      name: 'Quizzes', 
      count: quizzes.length, 
      percentage: quizPercentage,
      icon: <Box className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-500'
    },
    { 
      name: 'PDF Analysis', 
      count: pdfAnalyses.length, 
      percentage: pdfPercentage,
      icon: <FileQuestion className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-500'
    },
    { 
      name: 'Image Analysis', 
      count: imageAnalyses.length, 
      percentage: imagePercentage,
      icon: <ImageIcon className="h-5 w-5 text-amber-600" />,
      color: 'bg-amber-500'
    },
    { 
      name: 'PDF Chat', 
      count: pdfChatAnalyses.length, 
      percentage: pdfChatPercentage,
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      color: 'bg-green-500'
    }
  ].sort((a, b) => b.count - a.count);
  
  // Calculate most used subject categories from quizzes
  const subjectCounts = quizzes.reduce((acc, quiz) => {
    if (!quiz.subject) return acc;
    if (!acc[quiz.subject]) {
      acc[quiz.subject] = 0;
    }
    acc[quiz.subject]++;
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array and sort by count
  const topSubjects = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  // Calculate time distribution across tools
  const quizTime = quizzes.reduce((acc, q) => acc + (q.time_spent || 0), 0);
  const pdfTime = pdfAnalyses.reduce((acc, p) => acc + (p.time_spent || 0), 0);
  const imageTime = imageAnalyses.reduce((acc, i) => acc + (i.time_spent || 0), 0);
  const totalTime = quizTime + pdfTime + imageTime;
  
  const quizTimePercentage = totalTime > 0 ? Math.round((quizTime / totalTime) * 100) : 0;
  const pdfTimePercentage = totalTime > 0 ? Math.round((pdfTime / totalTime) * 100) : 0;
  const imageTimePercentage = totalTime > 0 ? Math.round((imageTime / totalTime) * 100) : 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Learning Tools Usage</CardTitle>
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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
          Learning Tools Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {totalUsage === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No tool usage data yet</p>
            <p className="text-sm">Start using the learning tools to see your usage analytics</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tool Usage Distribution */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3">Tool Usage Distribution</h3>
              <div className="space-y-4">
                {toolUsage.map((tool, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {tool.icon}
                        <span className="ml-2 text-sm font-medium">{tool.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">{tool.count}</span>
                        <span className="text-xs text-gray-500">{tool.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={tool.percentage} className={`h-2 ${tool.color}`} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time Spent Distribution */}
            {totalTime > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Time Distribution</h3>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-purple-500 h-full" 
                        style={{ width: `${quizTimePercentage}%` }}
                        title={`Quizzes: ${quizTimePercentage}%`}
                      />
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${pdfTimePercentage}%` }}
                        title={`PDF Analysis: ${pdfTimePercentage}%`}
                      />
                      <div 
                        className="bg-amber-500 h-full" 
                        style={{ width: `${imageTimePercentage}%` }}
                        title={`Image Analysis: ${imageTimePercentage}%`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-1" />
                    <span>Quizzes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1" />
                    <span>PDF Analysis</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-1" />
                    <span>Image Analysis</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Most Studied Subjects */}
            {topSubjects.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Most Studied Subjects</h3>
                <div className="space-y-3">
                  {topSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`
                          w-2 h-8 rounded-full mr-3
                          ${index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 'bg-purple-500'}
                        `} />
                        <span className="text-sm font-medium">{subject.subject}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {subject.count} {subject.count === 1 ? 'quiz' : 'quizzes'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningToolsUsageCard; 