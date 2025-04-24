import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Quiz, PdfAnalysis, ImageAnalysis } from '@/lib/supabaseClient';

// Add new interface for PDF chat history
interface PdfChatAnalysis {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  conversation_count: number;
  messages_count: number;
  created_at: string;
  updated_at: string;
  pdf_chat_history_id: string;
}

interface DashboardData {
  quizzes: Quiz[];
  pdfAnalyses: PdfAnalysis[];
  imageAnalyses: ImageAnalysis[];
  pdfChatAnalyses: PdfChatAnalysis[]; // Add the PDF chat analyses
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

interface ActivityData {
  date: string;
  quizzes: number;
  pdfs: number;
  images: number;
  pdfChats: number; // Add PDF chats to activity data
}

interface DashboardStats {
  totalQuizzes: number;
  avgScore: number;
  totalPdfs: number;
  totalImages: number;
  totalPdfChats: number; // Add total PDF chats
  weeklyGrowth: {
    quizzes: number;
    pdfs: number;
    images: number;
    pdfChats: number; // Add PDF chats growth
  };
  activityData: ActivityData[];
}

export const useDashboardData = (userId: string): DashboardData & { stats: DashboardStats } => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pdfAnalyses, setPdfAnalyses] = useState<PdfAnalysis[]>([]);
  const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysis[]>([]);
  const [pdfChatAnalyses, setPdfChatAnalyses] = useState<PdfChatAnalysis[]>([]); // Add state for PDF chat
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    avgScore: 0,
    totalPdfs: 0,
    totalImages: 0,
    totalPdfChats: 0, // Initialize total PDF chats
    weeklyGrowth: {
      quizzes: 0,
      pdfs: 0,
      images: 0,
      pdfChats: 0, // Initialize PDF chats growth
    },
    activityData: []
  });

  const calculateStats = (
    currentQuizzes: Quiz[],
    currentPdfs: PdfAnalysis[],
    currentImages: ImageAnalysis[],
    currentPdfChats: PdfChatAnalysis[], // Add PDF chats parameter
  ) => {
    // Calculate totals
    const totalQuizzes = currentQuizzes.length;
    const totalPdfs = currentPdfs.length;
    const totalImages = currentImages.length;
    const totalPdfChats = currentPdfChats.length; // Calculate total PDF chats

    // Calculate average score
    const validScores = currentQuizzes.map(q => q.score).filter(Boolean);
    const avgScore = validScores.length 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;

    // Calculate weekly activity data
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const activityData = last7Days.map(date => {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        quizzes: currentQuizzes.filter(q => {
          const qDate = new Date(q.created_at);
          return qDate >= startOfDay && qDate < endOfDay;
        }).length,
        pdfs: currentPdfs.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate >= startOfDay && pDate < endOfDay;
        }).length,
        images: currentImages.filter(i => {
          const iDate = new Date(i.created_at);
          return iDate >= startOfDay && iDate < endOfDay;
        }).length,
        pdfChats: currentPdfChats.filter(pc => { // Add PDF chats filter
          const pcDate = new Date(pc.created_at);
          return pcDate >= startOfDay && pcDate < endOfDay;
        }).length
      };
    });

    // Calculate weekly growth
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);

    const calculateGrowth = (current: number, previous: number) => {
      return previous === 0 ? 0 : ((current - previous) / previous) * 100;
    };

    const thisWeekQuizzes = currentQuizzes.filter(q => new Date(q.created_at) >= weekAgo).length;
    const lastWeekQuizzes = currentQuizzes.filter(q => {
      const date = new Date(q.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const thisWeekPdfs = currentPdfs.filter(p => new Date(p.created_at) >= weekAgo).length;
    const lastWeekPdfs = currentPdfs.filter(p => {
      const date = new Date(p.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const thisWeekImages = currentImages.filter(i => new Date(i.created_at) >= weekAgo).length;
    const lastWeekImages = currentImages.filter(i => {
      const date = new Date(i.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const thisWeekPdfChats = currentPdfChats.filter(pc => new Date(pc.created_at) >= weekAgo).length;
    const lastWeekPdfChats = currentPdfChats.filter(pc => {
      const date = new Date(pc.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    setStats({
      totalQuizzes,
      avgScore,
      totalPdfs,
      totalImages,
      totalPdfChats, // Add total PDF chats
      weeklyGrowth: {
        quizzes: calculateGrowth(thisWeekQuizzes, lastWeekQuizzes),
        pdfs: calculateGrowth(thisWeekPdfs, lastWeekPdfs),
        images: calculateGrowth(thisWeekImages, lastWeekImages),
        pdfChats: calculateGrowth(thisWeekPdfChats, lastWeekPdfChats), // Add PDF chats growth
      },
      activityData
    });
  };

  const fetchData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Process the first three tables with standard queries
      const [quizResponse, pdfResponse, imageResponse] = await Promise.all([
        supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('pdf_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('image_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      // For the pdf_chat_analytics table, handle it separately with a try-catch
      // since it might not exist in the database yet
      let pdfChatData: PdfChatAnalysis[] = [];
      try {
        const { data, error } = await supabase
          .from('pdf_chat_analytics')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          // If there's an error, log it but continue with empty data
          console.warn('Error fetching pdf_chat_analytics:', error.message);
        } else {
          pdfChatData = data || [];
        }
      } catch (err) {
        console.warn('Exception fetching pdf_chat_analytics:', err);
        // Continue with empty data
      }

      // Set data from responses
      setQuizzes(quizResponse.data || []);
      setPdfAnalyses(pdfResponse.data || []);
      setImageAnalyses(imageResponse.data || []);
      setPdfChatAnalyses(pdfChatData);

      // Calculate stats from the fetched data
      calculateStats(
        quizResponse.data || [],
        pdfResponse.data || [],
        imageResponse.data || [],
        pdfChatData
      );
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error loading dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to updates for all tables
    const quizSubscription = supabase
      .channel('dashboard_quizzes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quizzes',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const pdfSubscription = supabase
      .channel('dashboard_pdfs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pdf_analyses',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const imageSubscription = supabase
      .channel('dashboard_images')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'image_analyses',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const pdfChatSubscription = supabase
      .channel('dashboard_pdf_chats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pdf_chat_analytics',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    // Initial data fetch
    fetchData();

    // Cleanup subscriptions
    return () => {
      quizSubscription.unsubscribe();
      pdfSubscription.unsubscribe();
      imageSubscription.unsubscribe();
      pdfChatSubscription.unsubscribe();
    };
  }, [userId]);

  // Expose the refresh function
  const refreshData = async () => {
    await fetchData();
  };

  return {
    quizzes,
    pdfAnalyses,
    imageAnalyses,
    pdfChatAnalyses,
    isLoading,
    error,
    refreshData,
    stats
  };
};

export default useDashboardData; 