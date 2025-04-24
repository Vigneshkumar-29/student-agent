import { supabase } from '../lib/supabaseClient';

/**
 * Utility function to seed test data into the database
 * This helps demonstrate how the dashboard would look with real data
 */
export const seedTestData = async (userId: string): Promise<{ success: boolean, message: string }> => {
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }

  try {
    // First, check if tables exist (if not, create them)
    await ensureTablesExist();
    
    // Generate dates for the past 7 days
    const dates = generatePastDates(7);
    
    // Insert quiz data
    const quizCount = 5;
    for (let i = 0; i < quizCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      await supabase.from('quizzes').insert({
        user_id: userId,
        title: `Test Quiz ${i + 1}`,
        score: Math.floor(Math.random() * 100),
        subject: ['Math', 'Science', 'History', 'English'][Math.floor(Math.random() * 4)],
        questions_count: Math.floor(Math.random() * 10) + 5,
        time_spent: Math.floor(Math.random() * 300) + 60,
        created_at: randomDate
      });
    }
    
    // Insert PDF analysis data
    const pdfCount = 3;
    for (let i = 0; i < pdfCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      await supabase.from('pdf_analyses').insert({
        user_id: userId,
        title: `Test PDF ${i + 1}`,
        page_count: Math.floor(Math.random() * 20) + 1,
        time_spent: Math.floor(Math.random() * 300) + 60,
        document_url: `https://example.com/pdf-${i + 1}.pdf`,
        created_at: randomDate
      });
    }
    
    // Insert Image analysis data
    const imageCount = 4;
    for (let i = 0; i < imageCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      await supabase.from('image_analyses').insert({
        user_id: userId,
        title: `Test Image ${i + 1}`,
        image_url: `https://example.com/image-${i + 1}.jpg`,
        analysis_type: ['OCR', 'Object Detection', 'Scene Analysis'][Math.floor(Math.random() * 3)],
        time_spent: Math.floor(Math.random() * 300) + 60,
        created_at: randomDate
      });
    }
    
    // Create PDF chat history and analytics if tables exist
    const pdfChatCount = 2;
    try {
      // First create chat history
      for (let i = 0; i < pdfChatCount; i++) {
        const randomDate = dates[Math.floor(Math.random() * dates.length)];
        const messageCount = Math.floor(Math.random() * 10) + 3;
        
        const messages = [];
        for (let j = 0; j < messageCount; j++) {
          messages.push({
            role: j % 2 === 0 ? 'user' : 'assistant',
            content: j % 2 === 0 ? `Test question ${j/2 + 1}` : `Test answer ${(j-1)/2 + 1}`,
            timestamp: new Date(randomDate).getTime() + j * 60000
          });
        }
        
        const { data: chatData } = await supabase.from('pdf_chat_history').insert({
          user_id: userId,
          file_name: `Test PDF Chat ${i + 1}.pdf`,
          messages: messages,
          created_at: randomDate,
          updated_at: randomDate
        }).select('id').single();
        
        // Then create analytics for each chat
        if (chatData?.id) {
          await supabase.from('pdf_chat_analytics').insert({
            user_id: userId,
            title: `Chat: Test PDF Chat ${i + 1}.pdf`,
            file_name: `Test PDF Chat ${i + 1}.pdf`,
            messages_count: messageCount,
            pdf_chat_history_id: chatData.id,
            created_at: randomDate,
            updated_at: randomDate
          });
        }
      }
    } catch (err) {
      console.warn('Could not seed PDF chat data:', err);
      // Continue even if PDF chat tables don't exist
    }
    
    return { 
      success: true, 
      message: `Successfully seeded test data: ${quizCount} quizzes, ${pdfCount} PDFs, ${imageCount} images, ${pdfChatCount} PDF chats` 
    };
  } catch (error) {
    console.error('Error seeding test data:', error);
    return { success: false, message: `Error seeding data: ${error instanceof Error ? error.message : String(error)}` };
  }
};

/**
 * Ensures required tables exist in the database
 */
const ensureTablesExist = async () => {
  // Check if tables exist, if not create them
  const { error: quizTableError } = await supabase.from('quizzes').select('id').limit(1);
  if (quizTableError && quizTableError.message.includes('does not exist')) {
    await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.quizzes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          score INTEGER,
          subject TEXT,
          questions_count INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
  }
  
  const { error: pdfTableError } = await supabase.from('pdf_analyses').select('id').limit(1);
  if (pdfTableError && pdfTableError.message.includes('does not exist')) {
    await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.pdf_analyses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          page_count INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0,
          document_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        ALTER TABLE public.pdf_analyses ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own PDF analyses" ON public.pdf_analyses FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own PDF analyses" ON public.pdf_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
  }
  
  const { error: imageTableError } = await supabase.from('image_analyses').select('id').limit(1);
  if (imageTableError && imageTableError.message.includes('does not exist')) {
    await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.image_analyses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          image_url TEXT,
          analysis_type TEXT,
          time_spent INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own image analyses" ON public.image_analyses FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own image analyses" ON public.image_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
  }
  
  // Create PDF chat tables if they don't exist
  try {
    const { error: pdfChatHistoryError } = await supabase.from('pdf_chat_history').select('id').limit(1);
    if (pdfChatHistoryError && pdfChatHistoryError.message.includes('does not exist')) {
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS public.pdf_chat_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            file_name TEXT,
            messages JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          ALTER TABLE public.pdf_chat_history ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Users can view their own PDF chat history" ON public.pdf_chat_history FOR SELECT USING (auth.uid() = user_id);
          CREATE POLICY "Users can create their own PDF chat history" ON public.pdf_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
        `
      });
    }
    
    const { error: pdfChatAnalyticsError } = await supabase.from('pdf_chat_analytics').select('id').limit(1);
    if (pdfChatAnalyticsError && pdfChatAnalyticsError.message.includes('does not exist')) {
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS public.pdf_chat_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            file_name TEXT,
            conversation_count INTEGER DEFAULT 1,
            messages_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            pdf_chat_history_id UUID REFERENCES public.pdf_chat_history(id) ON DELETE CASCADE
          );
          ALTER TABLE public.pdf_chat_analytics ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Users can view their own PDF chat analytics" ON public.pdf_chat_analytics FOR SELECT USING (auth.uid() = user_id);
          CREATE POLICY "Users can create their own PDF chat analytics" ON public.pdf_chat_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
        `
      });
    }
  } catch (err) {
    console.warn('Error creating PDF chat tables:', err);
    // Continue even if we can't create these tables
  }
};

/**
 * Generate dates for the past N days
 */
const generatePastDates = (days: number): Date[] => {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  
  return dates;
};

export default seedTestData; 