-- Fix the notes table by adding the ai_content column if it doesn't exist
DO $$
BEGIN
  -- First check if column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'notes'
    AND column_name = 'ai_content'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE notes ADD COLUMN ai_content JSONB DEFAULT NULL;
    RAISE NOTICE 'Added ai_content column to notes table';
  ELSE
    RAISE NOTICE 'ai_content column already exists in notes table';
  END IF;
END
$$;

-- Refresh schema cache to ensure PostgREST sees the new column
NOTIFY pgrst, 'reload schema'; 