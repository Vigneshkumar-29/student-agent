import { supabase } from '../lib/supabaseClient';

/**
 * Utility function to create all the necessary database tables
 * This is useful when running the app for the first time or in development
 */
export const createDatabaseTables = async (): Promise<{ success: boolean, message: string }> => {
  try {
    // First check if we can execute SQL
    const { error: testError } = await supabase.rpc('execute_sql', {
      sql_string: 'SELECT 1;'
    });

    if (testError) {
      // If the execute_sql function doesn't exist, we can't create tables this way
      console.error('execute_sql function not available:', testError);
      return { 
        success: false, 
        message: 'The database is not configured to allow creating tables from the application. ' +
                'Please run the migration scripts directly on the database.' 
      };
    }

    // Create quizzes table
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
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Users can view their own quizzes'
          ) THEN
            CREATE POLICY "Users can view their own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Users can create their own quizzes'
          ) THEN
            CREATE POLICY "Users can create their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;
      `
    });

    // Create PDF analyses table
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
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_analyses' AND policyname = 'Users can view their own PDF analyses'
          ) THEN
            CREATE POLICY "Users can view their own PDF analyses" ON public.pdf_analyses FOR SELECT USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_analyses' AND policyname = 'Users can create their own PDF analyses'
          ) THEN
            CREATE POLICY "Users can create their own PDF analyses" ON public.pdf_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;
      `
    });

    // Create image analyses table
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
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'image_analyses' AND policyname = 'Users can view their own image analyses'
          ) THEN
            CREATE POLICY "Users can view their own image analyses" ON public.image_analyses FOR SELECT USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'image_analyses' AND policyname = 'Users can create their own image analyses'
          ) THEN
            CREATE POLICY "Users can create their own image analyses" ON public.image_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;
      `
    });

    // Create PDF chat tables
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
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_chat_history' AND policyname = 'Users can view their own PDF chat history'
          ) THEN
            CREATE POLICY "Users can view their own PDF chat history" ON public.pdf_chat_history FOR SELECT USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_chat_history' AND policyname = 'Users can create their own PDF chat history'
          ) THEN
            CREATE POLICY "Users can create their own PDF chat history" ON public.pdf_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;
        
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
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_chat_analytics' AND policyname = 'Users can view their own PDF chat analytics'
          ) THEN
            CREATE POLICY "Users can view their own PDF chat analytics" ON public.pdf_chat_analytics FOR SELECT USING (auth.uid() = user_id);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'pdf_chat_analytics' AND policyname = 'Users can create their own PDF chat analytics'
          ) THEN
            CREATE POLICY "Users can create their own PDF chat analytics" ON public.pdf_chat_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
          END IF;
        END $$;
        
        -- Create trigger to update timestamps
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger to sync PDF chat analytics
        CREATE OR REPLACE FUNCTION create_pdf_chat_analytics_on_history_insert()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.pdf_chat_analytics (
            user_id,
            title,
            file_name,
            messages_count,
            pdf_chat_history_id,
            created_at,
            updated_at
          ) VALUES (
            NEW.user_id,
            COALESCE(NEW.file_name, 'PDF Analysis'),
            NEW.file_name,
            COALESCE(jsonb_array_length(NEW.messages), 0),
            NEW.id,
            NEW.created_at,
            NEW.updated_at
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS create_pdf_chat_analytics_on_history_insert ON public.pdf_chat_history;
        CREATE TRIGGER create_pdf_chat_analytics_on_history_insert
        AFTER INSERT ON public.pdf_chat_history
        FOR EACH ROW
        EXECUTE FUNCTION create_pdf_chat_analytics_on_history_insert();
      `
    });

    return { 
      success: true, 
      message: 'All tables created successfully. The dashboard should now work correctly.' 
    };
  } catch (error) {
    console.error('Error creating tables:', error);
    return { 
      success: false, 
      message: `Error creating tables: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export default createDatabaseTables; 