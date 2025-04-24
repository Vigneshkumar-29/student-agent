import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';
import runNotesMigration from './runMigration';

// Basic migration utility to ensure database is properly structured
export const runMigrations = async (userId: string) => {
  try {
    console.log('Running migrations for user:', userId);
    
    // Run the full database migration using our separate utility
    const success = await runNotesMigration(userId);
    if (!success) {
      throw new Error('Failed to run database migration');
    }
    
    // Ensure AI content structure exists in notes
    await migrateNotesAIContent(userId);
    
    // Ensure note history table has AI content column
    await migrateNoteHistoryAIContent(userId);
    
    console.log('Migrations completed successfully');
    return true;
  } catch (err) {
    console.error('Migration failed:', err);
    toast({
      title: 'Migration Error',
      description: err instanceof Error ? err.message : 'Failed to update database structure',
      variant: 'destructive',
    });
    return false;
  }
};

// Migrate notes to ensure AI content structure exists
export const migrateNotesAIContent = async (userId: string) => {
  try {
    console.log('Migrating notes AI content for user:', userId);
    
    // Get all user notes
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No notes to migrate');
      return 0;
    }
    
    console.log(`Found ${data.length} notes to check for migration`);
    
    // Track number of notes updated
    let migratedCount = 0;
    
    // Process each note
    for (const note of data) {
      // If ai_content is null or undefined, initialize it
      if (note.ai_content === null || note.ai_content === undefined) {
        console.log(`Migrating note: ${note.id}`);
        
        // Initialize with default structure
        const defaultAIContent = {
          summary: '',
          keyConcepts: [],
          flashcards: [],
          mindmap: {
            nodes: [{ id: 'main', label: note.title || 'Main Topic' }],
            links: []
          }
        };
        
        // Update the note
        const { error: updateError } = await supabase
          .from('notes')
          .update({
            ai_content: defaultAIContent
          })
          .eq('id', note.id)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`Error updating note ${note.id}:`, updateError);
        } else {
          migratedCount++;
        }
      }
    }
    
    console.log(`Migration complete: ${migratedCount} notes updated`);
    return migratedCount;
  } catch (err) {
    console.error('Notes migration failed:', err);
    throw err;
  }
};

// Migrate note history table to ensure AI content column exists and contains proper values
export const migrateNoteHistoryAIContent = async (userId: string) => {
  try {
    console.log('Migrating note history AI content for user:', userId);
    
    // First, check if we can access the note_history table
    try {
      const { error } = await supabase
        .from('note_history')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.warn('Cannot access note_history table, it may not exist:', error);
        return 0;
      }
    } catch (err) {
      console.warn('Error checking note_history table:', err);
      return 0;
    }
    
    // Get all user history entries that need migration
    let data;
    let error;
    
    try {
      // First try with is null filter
      const result = await supabase
        .from('note_history')
        .select('id, note_id')
        .eq('user_id', userId)
        .is('ai_content', null);
      
      data = result.data;
      error = result.error;
    } catch (filterErr) {
      // If that fails, try without the filter
      console.warn('Error with filter query, trying fallback:', filterErr);
      
      const fallbackResult = await supabase
        .from('note_history')
        .select('id, note_id')
        .eq('user_id', userId);
      
      data = fallbackResult.data;
      error = fallbackResult.error;
    }
    
    if (error) {
      console.warn('Error fetching note history:', error);
      return 0;
    }
    
    if (!data || data.length === 0) {
      console.log('No history entries to migrate');
      return 0;
    }
    
    console.log(`Found ${data.length} history entries to check for migration`);
    
    // Track number of history entries updated
    let migratedCount = 0;
    
    // Process each history entry
    for (const entry of data) {
      // Get the corresponding note's AI content
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('ai_content')
        .eq('id', entry.note_id)
        .single();
      
      if (noteError) {
        console.warn(`Error getting note ${entry.note_id} for history entry ${entry.id}:`, noteError);
        continue;
      }
      
      // If the note has AI content, update the history entry
      if (noteData && noteData.ai_content) {
        const { error: updateError } = await supabase
          .from('note_history')
          .update({ ai_content: noteData.ai_content })
          .eq('id', entry.id)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`Error updating history entry ${entry.id}:`, updateError);
        } else {
          migratedCount++;
        }
      } else {
        // If the note doesn't have AI content, add an empty structure
        const defaultAIContent = {
          summary: '',
          keyConcepts: [],
          flashcards: [],
          mindmap: {
            nodes: [],
            links: []
          }
        };
        
        const { error: updateError } = await supabase
          .from('note_history')
          .update({ ai_content: defaultAIContent })
          .eq('id', entry.id)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`Error updating history entry ${entry.id} with default AI content:`, updateError);
        } else {
          migratedCount++;
        }
      }
    }
    
    console.log(`History migration complete: ${migratedCount} history entries updated`);
    return migratedCount;
  } catch (err) {
    console.error('Note history migration failed:', err);
    return 0; // Return 0 instead of throwing to prevent the whole migration from failing
  }
};

// Get database schema information without relying on exec_sql
export const getSchemaInfo = async () => {
  try {
    // Try to get information about tables by directly querying them
    const tables = ['notes', 'note_history'];
    const schemaInfo = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);
        
        schemaInfo.push({
          table_name: table,
          exists: !error,
          error: error ? error.message : null
        });
      } catch (tableErr) {
        schemaInfo.push({
          table_name: table,
          exists: false,
          error: tableErr instanceof Error ? tableErr.message : 'Unknown error'
        });
      }
    }
    
    return schemaInfo;
  } catch (err) {
    console.error('Error fetching schema info:', err);
    return [];
  }
}; 