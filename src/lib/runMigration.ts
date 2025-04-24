import { supabase } from './supabase';

/**
 * Runs a complete migration script for the notes application database
 * @param userId The ID of the current user
 * @returns Success status of the migration
 */
export const runNotesMigration = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('No user ID provided for database migration');
    return false;
  }

  try {
    console.log('Starting notes database migration for user:', userId);

    // 1. Create UUID extension
    await supabase.rpc('exec_sql', { 
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` 
    });
    
    // 2. Create the notes table
    await supabase.rpc('exec_sql', { 
      sql: `
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
      `
    });
    
    // 3. Create note history table
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS note_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // 4. Add AI content column if it doesn't exist
    await supabase.rpc('exec_sql', { 
      sql: `
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
      `
    });
    
    // 5. Enable row level security
    await supabase.rpc('exec_sql', { 
      sql: `
        ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE note_history ENABLE ROW LEVEL SECURITY;
      `
    });
    
    // 6. Drop existing policies before recreating
    await supabase.rpc('exec_sql', { 
      sql: `
        DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
        DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
        DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
        DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
        
        DROP POLICY IF EXISTS "Users can view their own note history" ON note_history;
        DROP POLICY IF EXISTS "Users can insert their own note history" ON note_history;
      `
    });
    
    // 7. Create row level security policies for notes
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Users can view their own notes" 
          ON notes FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own notes" 
          ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own notes" 
          ON notes FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own notes" 
          ON notes FOR DELETE USING (auth.uid() = user_id);
      `
    });
    
    // 8. Create row level security policies for note history
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Users can view their own note history" 
          ON note_history FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own note history" 
          ON note_history FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    // 9. Create indexes for better performance
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
        CREATE INDEX IF NOT EXISTS note_history_user_id_idx ON note_history(user_id);
        CREATE INDEX IF NOT EXISTS note_history_note_id_idx ON note_history(note_id);
      `
    });
    
    // 10. Add a trigger to update the updatedAt timestamp automatically
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE OR REPLACE FUNCTION update_notes_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
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
      `
    });
    
    // 11. Add a function to create note history entries
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE OR REPLACE FUNCTION create_note_history_entry()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO note_history (user_id, note_id, title)
          VALUES (NEW.user_id, NEW.id, NEW.title);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
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
      `
    });
    
    console.log('Notes database migration completed successfully');
    return true;
  } catch (err) {
    console.error('Error during notes database migration:', err);
    return false;
  }
};

export default runNotesMigration; 