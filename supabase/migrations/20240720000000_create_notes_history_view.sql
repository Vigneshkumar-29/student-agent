-- Create a view to show note history with associated note content
CREATE OR REPLACE VIEW note_history_view AS
SELECT
  h.id AS history_id,
  h.user_id,
  h.note_id,
  h.title AS history_title,
  h.created_at AS history_timestamp,
  n.title AS current_title,
  n.content,
  n.tags,
  n.ai_content,
  n."createdAt" AS note_created_at,
  n."updatedAt" AS note_updated_at
FROM
  note_history h
JOIN
  notes n ON h.note_id = n.id
ORDER BY
  h.created_at DESC;

-- Function to get note history with full content for a specific note
CREATE OR REPLACE FUNCTION get_note_history(p_note_id UUID, p_user_id UUID)
RETURNS TABLE (
  history_id UUID,
  user_id UUID,
  note_id UUID,
  history_title TEXT,
  history_timestamp TIMESTAMPTZ,
  current_title TEXT,
  content TEXT,
  tags TEXT[],
  ai_content JSONB,
  note_created_at TIMESTAMPTZ,
  note_updated_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM note_history_view
  WHERE note_id = p_note_id AND user_id = p_user_id
  ORDER BY history_timestamp DESC;
$$;

-- Add RLS policy to the view
CREATE POLICY "Users can view their own note history view"
  ON note_history_view FOR SELECT
  USING (auth.uid() = user_id);

-- Add a trigger to save AI content on significant changes
CREATE OR REPLACE FUNCTION track_ai_content_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track when AI content changes significantly
  IF OLD.ai_content IS DISTINCT FROM NEW.ai_content THEN
    -- Insert history entry
    INSERT INTO note_history (user_id, note_id, title)
    VALUES (NEW.user_id, NEW.id, NEW.title || ' (AI content updated)');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to notes table
DROP TRIGGER IF EXISTS track_ai_content_trigger ON notes;
CREATE TRIGGER track_ai_content_trigger
AFTER UPDATE OF ai_content ON notes
FOR EACH ROW
WHEN (OLD.ai_content IS DISTINCT FROM NEW.ai_content)
EXECUTE FUNCTION track_ai_content_changes(); 