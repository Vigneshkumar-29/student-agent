import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, FileText, Calendar as CalendarIcon, Clock, Award, BookOpen, CheckCircle, AlertCircle, BarChart3, Box, FileQuestion, Image as ImageIcon, Brain, Loader2, RefreshCw, TrendingUp, MessageSquare, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardRealTimeUpdates from '@/components/DashboardRealTimeUpdates';
import { Skeleton } from "@/components/ui/skeleton";
import { syncPdfChatAnalytics } from '@/lib/syncPdfChatAnalytics';
import { toast } from "@/components/ui/use-toast";
import SeedDataButton from '@/components/SeedDataButton';
import SetupDatabaseButton from '@/components/SetupDatabaseButton';
import StudentPerformanceCard from '@/components/StudentPerformanceCard';
import LearningToolsUsageCard from '@/components/LearningToolsUsageCard';
import StudentActivityTimelineCard from '@/components/StudentActivityTimelineCard';

interface ToolUsage {
  name: string;
  usage: number;
  route: string;
  icon: JSX.Element;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  score?: number;
  route: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('combined');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const {
    quizzes,
    pdfAnalyses,
    imageAnalyses,
    pdfChatAnalyses,
    isLoading,
    error,
    refreshData,
    stats
  } = useDashboardData(user?.id || '');

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={refreshData}
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle unauthorized state
  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="mb-4">You need to be signed in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  // Calculate recent activity
  const recentActivity: RecentActivity[] = [
    ...quizzes.slice(0, 4).map(q => ({
      id: q.id,
      type: 'quiz',
      title: q.title || 'Quiz',
      date: q.created_at,
      score: q.score,
      route: `/quiz-results/${q.id}`
    })),
    ...pdfAnalyses.slice(0, 4).map(p => ({
      id: p.id,
      type: 'pdf',
      title: p.title || 'PDF Analysis',
      date: p.created_at,
      route: `/pdf-qa/${p.id}`
    })),
    ...imageAnalyses.slice(0, 4).map(i => ({
      id: i.id,
      type: 'image',
      title: i.title || 'Image Analysis',
      date: i.created_at,
      route: `/image-qa/${i.id}`
    })),
    ...pdfChatAnalyses.slice(0, 4).map(pc => ({
      id: pc.id,
      type: 'pdf_chat',
      title: `Chat: ${pc.file_name}`,
      date: pc.created_at,
      route: `/pdf-qa`
    }))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 4);

  // Calculate tool usage
  const toolUsage: ToolUsage[] = [
    { 
      name: "Quiz Generator", 
      usage: stats.totalQuizzes, 
      route: "/quiz-generator",
      icon: <Box className="h-4 w-4" />,
      bgColor: "bg-purple-100"
    },
    { 
      name: "PDF Assistant", 
      usage: stats.totalPdfs, 
      route: "/pdf-qa",
      icon: <FileQuestion className="h-4 w-4" />,
      bgColor: "bg-blue-100"
    },
    { 
      name: "PDF Chat",
      usage: stats.totalPdfChats, 
      route: "/pdf-qa",
      icon: <MessageSquare className="h-4 w-4" />,
      bgColor: "bg-green-100"
    },
    { 
      name: "Image Analysis", 
      usage: stats.totalImages, 
      route: "/image-qa",
      icon: <ImageIcon className="h-4 w-4" />,
      bgColor: "bg-amber-100"
    }
  ];

  // Calculate total usage including all tools
  const totalUsage = stats.totalQuizzes + stats.totalPdfs + stats.totalImages + stats.totalPdfChats;

  // Sync PDF chat analytics if needed
  useEffect(() => {
    const syncAnalytics = async () => {
      if (user && !isSyncing && pdfChatAnalyses.length === 0) {
        try {
          setIsSyncing(true);
          // Don't throw errors if the table doesn't exist
          await syncPdfChatAnalytics().catch(error => {
            console.error("Error during PDF chat sync:", error);
            // Don't propagate the error - we'll just continue without the analytics
          });
          // Refresh data after syncing
          await refreshData();
        } catch (error) {
          console.error("Error syncing PDF chat analytics:", error);
          // Don't show an error notification for this - it's expected if the table doesn't exist
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    syncAnalytics();
  }, [user, pdfChatAnalyses.length, refreshData, isSyncing]);

  // Add a manual sync function
  const handleManualSync = async () => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      toast({
        title: "Syncing data",
        description: "Connecting all your learning activities for the dashboard...",
      });
      
      await syncPdfChatAnalytics();
      await refreshData();
      
      toast({
        title: "Sync completed",
        description: "Your dashboard is now up to date with all your learning activities.",
      });
    } catch (error) {
      console.error("Error during manual sync:", error);
      toast({
        title: "Sync error",
        description: "There was a problem syncing your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'quiz': return <Box className="h-4 w-4 text-purple-600" />;
      case 'pdf': return <FileQuestion className="h-4 w-4 text-blue-600" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-amber-600" />;
      case 'pdf_chat': return <MessageSquare className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 pb-20">
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Learning Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading || isSyncing}
            className="flex items-center gap-2"
          >
            {isLoading || isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isLoading || isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span>Sync All Data</span>
          </Button>
          <SetupDatabaseButton onSuccess={refreshData} />
          <SeedDataButton userId={user?.id} onSuccess={refreshData} />
          <div className="flex items-center space-x-2 bg-white shadow-sm rounded-lg p-2 border border-gray-100">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StudentPerformanceCard
          quizzes={quizzes}
          pdfAnalyses={pdfAnalyses}
          imageAnalyses={imageAnalyses}
          isLoading={isLoading}
        />
        <LearningToolsUsageCard
          quizzes={quizzes}
          pdfAnalyses={pdfAnalyses}
          imageAnalyses={imageAnalyses}
          pdfChatAnalyses={pdfChatAnalyses}
          isLoading={isLoading}
        />
        <StudentActivityTimelineCard
          quizzes={quizzes}
          pdfAnalyses={pdfAnalyses}
          imageAnalyses={imageAnalyses}
          pdfChatAnalyses={pdfChatAnalyses}
          isLoading={isLoading}
        />
      </div>

      {/* Summary Card - New Row */}
      <div className="mb-8">
        <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-2">Learning Activity Summary</h2>
                <p className="text-gray-600 mb-4">
                  Your dashboard shows real-time data from all your learning activities.
                </p>
                <StatsCard
                  title="Total Activities"
                  value={totalUsage}
                  icon={<Award className="h-4 w-4" />}
                  color="purple"
                  subtitle="All time"
                  additionalContent={
                    <Progress 
                      value={totalUsage > 0 ? 100 : 0} 
                      className="mt-4"
                    />
                  }
                  isLoading={isLoading}
                />
              </div>

              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Box className="h-4 w-4 text-purple-600" />
                      </div>
                      <Badge variant="outline">{stats.totalQuizzes}</Badge>
                    </div>
                    <div className="text-sm font-medium">Quizzes</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.weeklyGrowth.quizzes > 0 ? (
                        <span className="flex items-center text-green-600">
                          <ArrowUp className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.quizzes).toFixed(0)}%
                        </span>
                      ) : stats.weeklyGrowth.quizzes < 0 ? (
                        <span className="flex items-center text-red-600">
                          <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.quizzes).toFixed(0)}%
                        </span>
                      ) : (
                        <span>No change</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <Badge variant="outline">{stats.totalPdfs}</Badge>
                    </div>
                    <div className="text-sm font-medium">PDF Analysis</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.weeklyGrowth.pdfs > 0 ? (
                        <span className="flex items-center text-green-600">
                          <ArrowUp className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.pdfs).toFixed(0)}%
                        </span>
                      ) : stats.weeklyGrowth.pdfs < 0 ? (
                        <span className="flex items-center text-red-600">
                          <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.pdfs).toFixed(0)}%
                        </span>
                      ) : (
                        <span>No change</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <Badge variant="outline">{stats.totalPdfChats}</Badge>
                    </div>
                    <div className="text-sm font-medium">PDF Chats</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.weeklyGrowth.pdfChats > 0 ? (
                        <span className="flex items-center text-green-600">
                          <ArrowUp className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.pdfChats).toFixed(0)}%
                        </span>
                      ) : stats.weeklyGrowth.pdfChats < 0 ? (
                        <span className="flex items-center text-red-600">
                          <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.pdfChats).toFixed(0)}%
                        </span>
                      ) : (
                        <span>No change</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <ImageIcon className="h-4 w-4 text-amber-600" />
                      </div>
                      <Badge variant="outline">{stats.totalImages}</Badge>
                    </div>
                    <div className="text-sm font-medium">Image Analysis</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.weeklyGrowth.images > 0 ? (
                        <span className="flex items-center text-green-600">
                          <ArrowUp className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.images).toFixed(0)}%
                        </span>
                      ) : stats.weeklyGrowth.images < 0 ? (
                        <span className="flex items-center text-red-600">
                          <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(stats.weeklyGrowth.images).toFixed(0)}%
                        </span>
                      ) : (
                        <span>No change</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tool Usage Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-indigo-600" />
          Tool Usage Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolUsage.map((tool, index) => (
            <Card key={index} className="border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-full ${tool.bgColor}`}>
                    {tool.icon}
                  </div>
                  <span className="ml-2 font-medium text-sm">{tool.name}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">{tool.usage}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigate(tool.route)}
                  >
                    View Tool
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Quizzes Generated"
          value={stats.totalQuizzes}
          icon={<Box className="h-4 w-4" />}
          color="purple"
          subtitle="Total"
          additionalContent={
            stats.avgScore > 0 && (
              <div className="flex items-center mt-4 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-1" /> 
                <span>Average score: {stats.avgScore.toFixed(0)}%</span>
              </div>
            )
          }
          isLoading={isLoading}
        />

        <StatsCard
          title="PDF Documents Analyzed"
          value={stats.totalPdfs}
          icon={<FileText className="h-4 w-4" />}
          color="blue"
          subtitle="Total"
          additionalContent={
            stats.weeklyGrowth.pdfs !== 0 && (
              <div className="flex items-center mt-4 text-sm text-gray-600">
                {stats.weeklyGrowth.pdfs > 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1 text-red-600" />
                )}
                <span>
                  {Math.abs(stats.weeklyGrowth.pdfs).toFixed(0)}% {stats.weeklyGrowth.pdfs >= 0 ? 'increase' : 'decrease'} from last week
                </span>
              </div>
            )
          }
          isLoading={isLoading}
        />

        <StatsCard
          title="PDF Chats"
          value={stats.totalPdfChats}
          icon={<MessageSquare className="h-4 w-4" />}
          color="green"
          subtitle="Total"
          additionalContent={
            stats.weeklyGrowth.pdfChats !== 0 && (
              <div className="flex items-center mt-4 text-sm text-gray-600">
                {stats.weeklyGrowth.pdfChats > 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1 text-red-600" />
                )}
                <span>
                  {Math.abs(stats.weeklyGrowth.pdfChats).toFixed(0)}% {stats.weeklyGrowth.pdfChats >= 0 ? 'increase' : 'decrease'} from last week
                </span>
              </div>
            )
          }
          isLoading={isLoading}
        />

        <StatsCard
          title="Images Analyzed"
          value={stats.totalImages}
          icon={<ImageIcon className="h-4 w-4" />}
          color="amber"
          subtitle="Total"
          additionalContent={
            stats.weeklyGrowth.images !== 0 && (
              <div className="flex items-center mt-4 text-sm text-gray-600">
                {stats.weeklyGrowth.images > 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1 text-red-600" />
                )}
                <span>
                  {Math.abs(stats.weeklyGrowth.images).toFixed(0)}% {stats.weeklyGrowth.images >= 0 ? 'increase' : 'decrease'} from last week
                </span>
              </div>
            )
          }
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Learning Activity</CardTitle>
            <CardDescription>Track your usage of different tools</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Tabs defaultValue="combined" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="combined">All Activities</TabsTrigger>
                  <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="combined">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={stats.activityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quizzes" name="Quizzes" stackId="a" fill="#8884d8" />
                        <Bar dataKey="pdfs" name="PDF Documents" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="pdfChats" name="PDF Chats" stackId="a" fill="#4ade80" />
                        <Bar dataKey="images" name="Images" stackId="a" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="quizzes">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="quizzes" 
                          name="Quizzes Generated" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="pdfs" 
                          name="PDF Documents" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pdfChats" 
                          name="PDF Chats" 
                          stroke="#4ade80" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="images" 
                          name="Images" 
                          stroke="#ffc658" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tool Usage Distribution</CardTitle>
            <CardDescription>Where you spend your learning time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={toolUsage.map(tool => ({
                        name: tool.name,
                        value: tool.usage
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {toolUsage.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Your most used tools</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-md mr-4" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toolUsage.map((tool) => (
                  <div 
                    key={tool.name}
                    onClick={() => navigate(tool.route)}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className={`${tool.bgColor} p-3 rounded-md mr-4`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tool.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-gray-500">
                          Used {tool.usage} times
                        </div>
                        <Badge variant="outline">
                          {totalUsage > 0 ? Math.round((tool.usage / totalUsage) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button 
              className="w-full mt-4"
              variant="outline"
              onClick={() => navigate('/tools')}
            >
              View All Tools
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(activity.route)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.type)}
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      {activity.score && (
                        <Badge variant={activity.score > 80 ? "default" : "secondary"}>
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>No recent activity</p>
                </div>
              )}
              
              <Button 
                className="w-full mt-2" 
                variant="outline"
                size="sm"
                onClick={() => navigate('/activity')}
              >
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time updates component */}
      {user && <DashboardRealTimeUpdates userId={user.id} onNewData={refreshData} />}
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'amber' | 'green';
  subtitle: string;
  additionalContent?: React.ReactNode;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  additionalContent,
  isLoading = false
}) => {
  const colorMap = {
    purple: {
      border: 'border-l-purple-500',
      text: 'text-purple-600'
    },
    blue: {
      border: 'border-l-blue-500',
      text: 'text-blue-600'
    },
    amber: {
      border: 'border-l-amber-500',
      text: 'text-amber-600'
    },
    green: {
      border: 'border-l-green-500',
      text: 'text-green-600'
    }
  };

  return (
    <Card className={`border-l-4 ${colorMap[color].border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className={`text-3xl font-bold ${colorMap[color].text}`}>{value}</div>
          )}
          <div className="flex items-center text-sm text-gray-500">
            {icon} 
            <span className="ml-1">{subtitle}</span>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-full mt-4" />
        ) : (
          additionalContent
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard; 