-- Run this SQL script in your Supabase SQL Editor to create all necessary tables
-- Go to https://app.supabase.com > Your Project > SQL Editor > New Query

-- Create quizzes table
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
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
CREATE POLICY "Users can view their own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
CREATE POLICY "Users can create their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create PDF analyses table
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
DROP POLICY IF EXISTS "Users can view their own PDF analyses" ON public.pdf_analyses;
CREATE POLICY "Users can view their own PDF analyses" ON public.pdf_analyses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own PDF analyses" ON public.pdf_analyses;
CREATE POLICY "Users can create their own PDF analyses" ON public.pdf_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create image analyses table
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
DROP POLICY IF EXISTS "Users can view their own image analyses" ON public.image_analyses;
CREATE POLICY "Users can view their own image analyses" ON public.image_analyses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own image analyses" ON public.image_analyses;
CREATE POLICY "Users can create their own image analyses" ON public.image_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create PDF chat history table
CREATE TABLE IF NOT EXISTS public.pdf_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.pdf_chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own PDF chat history" ON public.pdf_chat_history;
CREATE POLICY "Users can view their own PDF chat history" ON public.pdf_chat_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own PDF chat history" ON public.pdf_chat_history;
CREATE POLICY "Users can create their own PDF chat history" ON public.pdf_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create PDF chat analytics table
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
DROP POLICY IF EXISTS "Users can view their own PDF chat analytics" ON public.pdf_chat_analytics;
CREATE POLICY "Users can view their own PDF chat analytics" ON public.pdf_chat_analytics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own PDF chat analytics" ON public.pdf_chat_analytics;
CREATE POLICY "Users can create their own PDF chat analytics" ON public.pdf_chat_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create analytics from chat history
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

-- Add trigger to pdf_chat_history
DROP TRIGGER IF EXISTS create_pdf_chat_analytics_on_history_insert ON public.pdf_chat_history;
CREATE TRIGGER create_pdf_chat_analytics_on_history_insert
AFTER INSERT ON public.pdf_chat_history
FOR EACH ROW
EXECUTE FUNCTION create_pdf_chat_analytics_on_history_insert();

-- Database setup for Notes application
-- This file contains all the SQL needed to set up the notes application tables, functions, 
-- indexes, and row-level security policies.

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to execute SQL dynamically (if you have permissions to do so)
-- Note: This requires elevated permissions and may not work in all environments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'exec_sql' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text) 
      RETURNS SETOF record 
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $BODY$
      DECLARE
        rec record;
      BEGIN
        FOR rec IN EXECUTE sql LOOP
          RETURN NEXT rec;
        END LOOP;
        RETURN;
      END;
      $BODY$;
    $FUNC$;
  END IF;
END
$$;

-- Drop existing tables if they exist and we're doing a fresh setup 
-- (uncomment if needed for a clean start)
-- DROP TABLE IF EXISTS note_history;
-- DROP TABLE IF EXISTS notes;

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'::TEXT[],
  ai_content JSONB DEFAULT NULL
);

-- Create note history table
CREATE TABLE IF NOT EXISTS note_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add AI content column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'notes'
    AND column_name = 'ai_content'
  ) THEN
    ALTER TABLE notes ADD COLUMN ai_content JSONB DEFAULT NULL;
  END IF;
END $$;

-- Enable row level security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

DROP POLICY IF EXISTS "Users can view their own note history" ON note_history;
DROP POLICY IF EXISTS "Users can insert their own note history" ON note_history;

-- Create row level security policies for notes
CREATE POLICY "Users can view their own notes" 
  ON notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" 
  ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON notes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON notes FOR DELETE USING (auth.uid() = user_id);

-- Create row level security policies for note history
CREATE POLICY "Users can view their own note history" 
  ON note_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note history" 
  ON note_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS note_history_user_id_idx ON note_history(user_id);
CREATE INDEX IF NOT EXISTS note_history_note_id_idx ON note_history(note_id);

-- Add a trigger to update the updatedAt timestamp automatically
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_notes_updated_at'
  ) THEN
    CREATE TRIGGER set_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();
  END IF;
END
$$;

-- Add a function to create note history entries
CREATE OR REPLACE FUNCTION create_note_history_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO note_history (user_id, note_id, title)
  VALUES (NEW.user_id, NEW.id, NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'note_history_insert_trigger'
  ) THEN
    CREATE TRIGGER note_history_insert_trigger
    AFTER INSERT ON notes
    FOR EACH ROW
    EXECUTE FUNCTION create_note_history_entry();
  END IF;
END
$$; 