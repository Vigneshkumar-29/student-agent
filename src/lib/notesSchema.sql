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