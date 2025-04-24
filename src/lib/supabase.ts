import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables and provide helpful error messages
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined. Please add it to your .env file.');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined. Please add it to your .env file.');
}

// Create Supabase client with additional options for better reliability
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      },
      fetch: (...args) => fetch(...args)
    },
    realtime: {
      timeout: 30000 // Longer timeout for better connection stability
    }
  }
);

// Check if client was successfully created - important for debugging connection issues
if (supabase) {
  console.log('✅ Supabase client initialized successfully!');
} else {
  console.error('❌ Failed to initialize Supabase client!');
}

// Export helper functions to handle common Supabase operations
export const db = {
  // Function to execute custom SQL
  async executeSQL(sql: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('SQL execution error:', err);
      throw err;
    }
  },
  
  // Function to check if a table exists and create it if it doesn't
  async ensureTable(tableName: string, createTableSQL: string): Promise<boolean> {
    try {
      // First check if table exists by attempting a simple query
      const { error } = await supabase
        .from(tableName)
        .select('count(*)')
        .limit(1);
      
      // If no error, table exists
      if (!error) {
        console.log(`Table ${tableName} exists`);
        return true;
      }
      
      // If error indicates table doesn't exist, create it
      if (error.message.includes('does not exist')) {
        console.log(`Creating table ${tableName}`);
        const { error: sqlError } = await supabase.rpc('exec_sql', { 
          sql: createTableSQL 
        });
        
        if (sqlError) {
          throw sqlError;
        }
        
        return true;
      }
      
      throw error;
    } catch (err) {
      console.error(`Error ensuring table ${tableName}:`, err);
      throw err;
    }
  }
};

// Export types to be used with Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Type definitions for database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          article_title: string;
          score: number;
          total_questions: number;
          correct_answers: number;
          questions: Array<{
            id: string;
            question: string;
            options: string[];
            correctAnswerId: string;
            userAnswer?: string;
          }>;
          time_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_title: string;
          score: number;
          total_questions: number;
          correct_answers: number;
          questions: Array<{
            id: string;
            question: string;
            options: string[];
            correctAnswerId: string;
            userAnswer?: string;
          }>;
          time_spent: number;
          created_at?: string;
        };
      };
      pdf_chat_history: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_content: string;
          messages: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: string;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_content: string;
          messages: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Helper functions for user profiles
export const profileOperations = {
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: { name?: string }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
};

// Helper functions for quiz operations
export const quizOperations = {
  saveQuizAttempt: async (attempt: any, userId: string) => {
    try {
      // Validate required fields
      if (!userId || !attempt) {
        throw new Error('Missing required fields for quiz attempt');
      }

      // Check for recent duplicate submissions (within last 5 seconds)
      const { data: recentAttempts } = await supabase
        .from('quiz_attempts')
        .select('created_at')
        .eq('user_id', userId)
        .eq('article_title', attempt.article_title || 'Untitled Quiz')
        .eq('score', Math.max(0, Math.min(100, attempt.score)))
        .gt('created_at', new Date(Date.now() - 5000).toISOString())
        .order('created_at', { ascending: false });

      if (recentAttempts && recentAttempts.length > 0) {
        console.log('Duplicate submission detected, skipping save');
        return recentAttempts[0];
      }

      // Format questions for database
      const formattedQuestions = attempt.questions.map((q: any) => ({
        id: q.id,
        question: q.text,
        options: q.options.map((opt: any) => opt.text),
        correctAnswerId: q.correctAnswerId,
        userAnswer: q.userAnswer || null
      }));

      // Insert quiz attempt directly
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          article_title: attempt.article_title || 'Untitled Quiz',
          score: Math.max(0, Math.min(100, attempt.score)),
          time_spent: Math.max(0, attempt.time_spent || 0),
          total_questions: attempt.total_questions || attempt.questions.length,
          correct_answers: attempt.correct_answers || attempt.questions.filter((q: any) => q.isCorrect).length,
          questions: formattedQuestions
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving quiz attempt:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveQuizAttempt:', error);
      throw error;
    }
  },

  getQuizHistory: async (userId: string) => {
    try {
      console.log('Getting quiz history for user:', userId);
      
      if (!userId) {
        console.warn('No user ID provided');
        throw new Error('User ID is required');
      }

      // Get the current session to ensure we're authenticated
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session?.session?.user ? 'authenticated' : 'not authenticated');
      
      if (!session?.session?.user) {
        console.warn('No authenticated session found');
        throw new Error('Not authenticated');
      }

      console.log('Fetching quiz attempts from database...');
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz history:', error);
        throw error;
      }

      console.log('Quiz history fetched:', data ? `${data.length} attempts found` : 'no attempts found');
      return data || [];
    } catch (error) {
      console.error('Error in getQuizHistory:', error);
      throw error;
    }
  },

  deleteQuiz: async (quizId: string, userId: string) => {
    try {
      if (!quizId || !userId) {
        throw new Error('Quiz ID and User ID are required');
      }

      // Get the current session to ensure we're authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('id', quizId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting quiz:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteQuiz:', error);
      throw error;
    }
  }
};

// Helper functions for PDF chat operations
export const pdfChatOperations = {
  async savePdfChat(chatData: Database['public']['Tables']['pdf_chat_history']['Insert']) {
    return await supabase
      .from('pdf_chat_history')
      .insert(chatData)
      .select()
      .single();
  },

  async getPdfChatHistory(userId: string) {
    return await supabase
      .from('pdf_chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async updatePdfChat(chatId: string, userId: string, messages: any[]) {
    return await supabase
      .from('pdf_chat_history')
      .update({
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .eq('user_id', userId);
  },

  async deletePdfChat(chatId: string, userId: string) {
    return await supabase
      .from('pdf_chat_history')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);
  }
};

// Add debug logging for auth events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, session });
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  }
});

// Database schema types
export interface QuizAttempt {
  id: string;
  user_id: string;
  date: string;
  score: number;
  time_spent: number;
  total_questions: number;
  correct_answers: number;
  article_title: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctAnswerId: string;
  }>;
  created_at?: string;
}
