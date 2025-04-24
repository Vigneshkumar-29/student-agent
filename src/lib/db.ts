// Connect to Supabase
import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

// Export a direct connect function to verify connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    // Attempt to make a simple query to check connection
    const { data, error } = await supabase.from('notes').select('count(*)', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection verified successfully!');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};

// Additional utility to get database schema information
export const getDatabaseInfo = async (): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name, 
          column_name, 
          data_type
        FROM 
          information_schema.columns
        WHERE 
          table_schema = 'public' 
        ORDER BY 
          table_name, ordinal_position;
      `
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching database info:', err);
    throw err;
  }
};

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  ai_content?: {
    summary?: string;
    keyConcepts?: {concept: string, description: string}[];
    flashcards?: {question: string, answer: string}[];
    mindmap?: {nodes: {id: string, label: string}[], links: {source: string, target: string}[]};
  };
}

// Export a notes DB object with note operations
export const notesDB = {
  // Get all notes for a user
  async getAll(userId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updatedAt', { ascending: false });

      if (error) throw error;
      
      // Process notes to ensure consistent structure
      return (data || []).map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        tags: Array.isArray(note.tags) ? note.tags : [],
        ai_content: note.ai_content || null
      }));
    } catch (err) {
      console.error('Error getting notes:', err);
      throw err;
    }
  },

  // Get a single note by ID
  async getById(noteId: string, userId: string): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        tags: Array.isArray(data.tags) ? data.tags : [],
        ai_content: data.ai_content || null
      };
    } catch (err) {
      console.error('Error getting note by ID:', err);
      return null;
    }
  },

  // Create a new note
  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
    try {
      const newNote = {
        user_id: note.user_id,
        title: note.title.trim() || 'Untitled Note',
        content: note.content,
        tags: Array.isArray(note.tags) ? note.tags : [],
        ai_content: note.ai_content || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Also create a history entry
      await this.createHistoryEntry(data[0].id, data[0].user_id, data[0].title)
        .catch(err => console.error('Error creating history entry:', err));

      return {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
        tags: Array.isArray(data[0].tags) ? data[0].tags : [],
        ai_content: data[0].ai_content
      };
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  },

  // Update an existing note
  async update(noteId: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'createdAt'>>): Promise<Note | null> {
    try {
      const noteUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (updates.tags && !Array.isArray(updates.tags)) {
        noteUpdates.tags = [];
      }

      const { data, error } = await supabase
        .from('notes')
        .update(noteUpdates)
        .eq('id', noteId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Create a history entry on significant updates
      if (updates.title) {
        await this.createHistoryEntry(noteId, data[0].user_id, updates.title)
          .catch(err => console.error('Error creating history entry on update:', err));
      }

      return {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
        tags: Array.isArray(data[0].tags) ? data[0].tags : [],
        ai_content: data[0].ai_content
      };
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  },

  // Delete a note
  async delete(noteId: string, userId: string): Promise<boolean> {
    try {
      // Note: Related history entries will be deleted automatically due to ON DELETE CASCADE
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      return false;
    }
  },

  // Create a history entry for a note
  async createHistoryEntry(noteId: string, userId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_history')
        .insert({
          note_id: noteId,
          user_id: userId,
          title: title,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating history entry:', err);
      throw err;
    }
  },

  // Get history for a user
  async getHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('note_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting note history:', err);
      return [];
    }
  },

  // Get history for a specific note
  async getNoteHistory(noteId: string, userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('note_history')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting note history:', err);
      return [];
    }
  }
};

export { supabase };
export default notesDB; 