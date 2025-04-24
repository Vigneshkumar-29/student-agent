-- Notes Database Schema Setup

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notes table with JSONB support for AI content
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Note',
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_content JSONB DEFAULT NULL
);

-- Create note history table with JSONB support for AI content
CREATE TABLE IF NOT EXISTS note_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_content JSONB DEFAULT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_note_history_user_id ON note_history(user_id);
CREATE INDEX IF NOT EXISTS idx_note_history_note_id ON note_history(note_id);

-- Add column for AI content if it doesn't exist (for migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'ai_content'
    ) THEN
        ALTER TABLE notes ADD COLUMN ai_content JSONB DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'note_history' AND column_name = 'ai_content'
    ) THEN
        ALTER TABLE note_history ADD COLUMN ai_content JSONB DEFAULT NULL;
    END IF;
END $$;

-- Enable RLS and set up policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notes table
DROP POLICY IF EXISTS notes_user_select ON notes;
CREATE POLICY notes_user_select ON notes
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notes_user_insert ON notes;
CREATE POLICY notes_user_insert ON notes
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notes_user_update ON notes;
CREATE POLICY notes_user_update ON notes
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS notes_user_delete ON notes;
CREATE POLICY notes_user_delete ON notes
    FOR DELETE USING (user_id = auth.uid());

-- Create policies for note_history table
DROP POLICY IF EXISTS note_history_user_select ON note_history;
CREATE POLICY note_history_user_select ON note_history
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS note_history_user_insert ON note_history;
CREATE POLICY note_history_user_insert ON note_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS note_history_user_delete ON note_history;
CREATE POLICY note_history_user_delete ON note_history
    FOR DELETE USING (user_id = auth.uid());

-- Create or replace function to update AI content
CREATE OR REPLACE FUNCTION update_note_ai_content(
    p_note_id UUID,
    p_ai_content JSONB
) RETURNS VOID AS $$
BEGIN
    UPDATE notes
    SET ai_content = p_ai_content, 
        "updatedAt" = NOW()
    WHERE id = p_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to fetch history with AI content
CREATE OR REPLACE FUNCTION get_note_history_with_ai_content(
    p_user_id UUID,
    p_note_id UUID DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    user_id UUID,
    note_id UUID,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    ai_content JSONB
) AS $$
BEGIN
    IF p_note_id IS NULL THEN
        RETURN QUERY
        SELECT h.id, h.user_id, h.note_id, h.title, h.created_at, h.ai_content
        FROM note_history h
        WHERE h.user_id = p_user_id
        ORDER BY h.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT h.id, h.user_id, h.note_id, h.title, h.created_at, h.ai_content
        FROM note_history h
        WHERE h.user_id = p_user_id AND h.note_id = p_note_id
        ORDER BY h.created_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 