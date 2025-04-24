-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up storage for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create quiz_attempts table with improved structure
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_title TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    time_spent INTEGER NOT NULL CHECK (time_spent >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_answers CHECK (correct_answers <= total_questions)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

-- Drop ALL existing versions of the function
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS public.create_quiz_attempt(TEXT, UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, JSONB);
    DROP FUNCTION IF EXISTS public.create_quiz_attempt(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, JSONB);
    DROP FUNCTION IF EXISTS public.create_quiz_attempt(TEXT, UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, TIMESTAMPTZ);
EXCEPTION 
    WHEN others THEN 
        NULL;
END $$;

-- Create the single, correct version of the function
CREATE OR REPLACE FUNCTION public.create_quiz_attempt(
    p_id TEXT,
    p_user_id UUID,
    p_article_title TEXT,
    p_score INTEGER,
    p_time_spent INTEGER,
    p_total_questions INTEGER,
    p_correct_answers INTEGER,
    p_questions JSONB
) RETURNS JSONB AS $$
DECLARE
    v_quiz_id TEXT;
    v_result JSONB;
BEGIN
    -- Input validation
    IF p_article_title IS NULL OR p_questions IS NULL THEN
        RAISE EXCEPTION 'Article title and questions are required';
    END IF;

    IF p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'Score must be between 0 and 100';
    END IF;

    IF p_correct_answers > p_total_questions THEN
        RAISE EXCEPTION 'Correct answers cannot exceed total questions';
    END IF;

    -- Generate quiz ID if not provided
    v_quiz_id := COALESCE(p_id, gen_random_uuid()::TEXT);

    -- Insert new quiz attempt
    INSERT INTO quiz_attempts (
        id,
        user_id,
        article_title,
        score,
        time_spent,
        total_questions,
        correct_answers,
        questions,
        created_at
    ) VALUES (
        v_quiz_id,
        p_user_id,
        p_article_title,
        p_score,
        p_time_spent,
        p_total_questions,
        p_correct_answers,
        p_questions,
        NOW()
    )
    RETURNING jsonb_build_object(
        'id', id,
        'user_id', user_id,
        'article_title', article_title,
        'score', score,
        'time_spent', time_spent,
        'total_questions', total_questions,
        'correct_answers', correct_answers,
        'questions', questions,
        'created_at', created_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for quiz_attempts with improved security
CREATE POLICY "Users can view own attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert own attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete own attempts"
    ON public.quiz_attempts FOR DELETE
    USING (auth.uid()::UUID = user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create trigger
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.quiz_attempts TO authenticated;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 