-- Create function to generate pdf_chat_analytics for existing history 
CREATE OR REPLACE FUNCTION sync_pdf_chat_analytics()
RETURNS void AS $$
DECLARE
  history_record RECORD;
BEGIN
  -- Loop through each pdf_chat_history record without analytics
  FOR history_record IN 
    SELECT h.* 
    FROM pdf_chat_history h
    LEFT JOIN pdf_chat_analytics a ON h.id = a.pdf_chat_history_id
    WHERE a.id IS NULL
  LOOP
    -- Insert a new analytics record for this chat history
    INSERT INTO pdf_chat_analytics (
      user_id,
      title,
      file_name,
      messages_count,
      pdf_chat_history_id,
      created_at,
      updated_at
    ) VALUES (
      history_record.user_id,
      COALESCE(history_record.file_name, 'PDF Analysis'),
      history_record.file_name,
      COALESCE(jsonb_array_length(history_record.messages), 0),
      history_record.id,
      history_record.created_at,
      COALESCE(history_record.updated_at, NOW())
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a SQL function that can be called from application code
CREATE OR REPLACE FUNCTION update_pdf_chat_stats()
RETURNS json AS $$
DECLARE
  result JSON;
BEGIN
  -- Call the synchronization function
  PERFORM sync_pdf_chat_analytics();
  
  -- Return statistics
  SELECT json_build_object(
    'success', true,
    'updated_count', (SELECT COUNT(*) FROM pdf_chat_analytics),
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 