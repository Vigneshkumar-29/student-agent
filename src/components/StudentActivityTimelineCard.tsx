import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Box, 
  FileQuestion, 
  ImageIcon, 
  MessageSquare,
  Activity,
  BookOpen
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  type: 'quiz' | 'pdf' | 'image' | 'pdf_chat';
  title: string;
  date: Date;
  score?: number;
}

interface StudentActivityTimelineCardProps {
  quizzes: any[];
  pdfAnalyses: any[];
  imageAnalyses: any[];
  pdfChatAnalyses: any[];
  isLoading: boolean;
}

const StudentActivityTimelineCard: React.FC<StudentActivityTimelineCardProps> = ({
  quizzes,
  pdfAnalyses,
  imageAnalyses,
  pdfChatAnalyses,
  isLoading
}) => {
  // Combine all activities into one timeline
  const allActivities: Activity[] = [
    ...quizzes.map(quiz => ({
      id: quiz.id,
      type: 'quiz' as const,
      title: quiz.title,
      date: new Date(quiz.created_at),
      score: quiz.score
    })),
    ...pdfAnalyses.map(pdf => ({
      id: pdf.id,
      type: 'pdf' as const,
      title: pdf.title,
      date: new Date(pdf.created_at)
    })),
    ...imageAnalyses.map(img => ({
      id: img.id,
      type: 'image' as const,
      title: img.title,
      date: new Date(img.created_at)
    })),
    ...pdfChatAnalyses.map(chat => ({
      id: chat.id,
      type: 'pdf_chat' as const,
      title: chat.title || `Chat: ${chat.file_name}`,
      date: new Date(chat.created_at)
    }))
  ];
  
  // Sort activities by date (newest first)
  const sortedActivities = allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Format date in a readable format
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get icon for activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quiz':
        return <Box className="h-4 w-4 text-purple-600" />;
      case 'pdf':
        return <FileQuestion className="h-4 w-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-amber-600" />;
      case 'pdf_chat':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
    }
  };
  
  // Get color for activity type
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'quiz':
        return 'bg-purple-500';
      case 'pdf':
        return 'bg-blue-500';
      case 'image':
        return 'bg-amber-500';
      case 'pdf_chat':
        return 'bg-green-500';
    }
  };
  
  // Get label for activity type
  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'quiz':
        return 'Quiz';
      case 'pdf':
        return 'PDF Analysis';
      case 'image':
        return 'Image Analysis';
      case 'pdf_chat':
        return 'PDF Chat';
    }
  };
  
  // Group activities by date
  const groupedActivities: Record<string, Activity[]> = {};
  
  sortedActivities.forEach(activity => {
    const dateKey = activity.date.toDateString();
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Activity Timeline</CardTitle>
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
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="h-5 w-5 mr-2 text-indigo-600" />
          Learning Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No activity data yet</p>
            <p className="text-sm">Your learning activities will appear here once you start using the tools</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedActivities).map(([dateKey, activities]) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-500">
                    {new Date(dateKey).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                </div>
                <div className="ml-2 space-y-3 pl-4 border-l border-gray-200">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      {/* Activity dot */}
                      <div className={`absolute -left-6 mt-1.5 w-2.5 h-2.5 rounded-full ${getActivityColor(activity.type)}`} />
                      
                      {/* Activity content */}
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getActivityIcon(activity.type)}
                            <span className="ml-2 text-xs font-medium text-gray-500">
                              {getActivityLabel(activity.type)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
                        </div>
                        <p className="mt-1 font-medium text-sm">{activity.title}</p>
                        {activity.type === 'quiz' && activity.score !== undefined && (
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Score</span>
                            <span className={`text-xs font-medium ${
                              activity.score >= 70 ? 'text-green-600' : 
                              activity.score >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {activity.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentActivityTimelineCard; 