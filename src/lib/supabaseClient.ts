import { createClient } from '@supabase/supabase-js';

// Create a single instance of the Supabase client to avoid "Multiple GoTrueClient instances" warning
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Types for our database tables
export type Quiz = {
  id: string;
  user_id: string;
  title: string;
  score: number;
  created_at: string;
  subject: string;
  questions_count: number;
  time_spent: number;
};

export type PdfAnalysis = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  page_count: number;
  time_spent: number;
  document_url: string;
};

export type ImageAnalysis = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  image_url: string;
  analysis_type: string;
  time_spent: number;
};

// Real-time subscriptions helper
export const subscribeToUserData = (
  userId: string,
  onQuizUpdate: (quiz: Quiz[]) => void,
  onPdfUpdate: (pdf: PdfAnalysis[]) => void,
  onImageUpdate: (image: ImageAnalysis[]) => void
) => {
  // Subscribe to quiz changes
  const quizSubscription = supabase
    .channel('quiz_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quizzes',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const { data } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (data) onQuizUpdate(data);
      }
    )
    .subscribe();

  // Subscribe to PDF analysis changes
  const pdfSubscription = supabase
    .channel('pdf_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pdf_analyses',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const { data } = await supabase
          .from('pdf_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (data) onPdfUpdate(data);
      }
    )
    .subscribe();

  // Subscribe to image analysis changes
  const imageSubscription = supabase
    .channel('image_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'image_analyses',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const { data } = await supabase
          .from('image_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (data) onImageUpdate(data);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    quizSubscription.unsubscribe();
    pdfSubscription.unsubscribe();
    imageSubscription.unsubscribe();
  };
}; 