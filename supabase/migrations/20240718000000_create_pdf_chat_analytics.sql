-- Create pdf_chat_analytics table
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

-- Add RLS (Row Level Security) policies
ALTER TABLE public.pdf_chat_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own records
CREATE POLICY "Users can view their own pdf chat analytics" 
  ON public.pdf_chat_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own records
CREATE POLICY "Users can create their own pdf chat analytics" 
  ON public.pdf_chat_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own records
CREATE POLICY "Users can update their own pdf chat analytics" 
  ON public.pdf_chat_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_pdf_chat_analytics_user_id ON public.pdf_chat_analytics(user_id);
CREATE INDEX idx_pdf_chat_analytics_history_id ON public.pdf_chat_analytics(pdf_chat_history_id);

-- Create trigger to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_pdf_chat_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pdf_chat_analytics_updated_at
BEFORE UPDATE ON public.pdf_chat_analytics
FOR EACH ROW
EXECUTE FUNCTION update_pdf_chat_analytics_updated_at();

-- Create trigger to automatically create analytics entry when a new pdf_chat_history is created
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

CREATE TRIGGER create_pdf_chat_analytics_on_history_insert
AFTER INSERT ON public.pdf_chat_history
FOR EACH ROW
EXECUTE FUNCTION create_pdf_chat_analytics_on_history_insert(); 