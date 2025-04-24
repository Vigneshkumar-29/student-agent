import { supabase } from './supabaseClient';

/**
 * This function creates analytics entries for any PDF chat history that doesn't have them
 * It's needed to populate the dashboard with historical PDF chat data
 */
export const syncPdfChatAnalytics = async (): Promise<void> => {
  try {
    // First check if analytics table exists
    const { error: tableCheckError } = await supabase
      .from('pdf_chat_analytics')
      .select('id')
      .limit(1);
    
    // If we get an error about the table not existing, display a more helpful message
    if (tableCheckError) {
      if (tableCheckError.message.includes('does not exist')) {
        console.warn('PDF chat analytics table not available. This feature requires database setup.');
        // Here you would ideally inform the user that they need to run migrations
        // or set up the database properly
        return;
      }
      console.warn('Error checking PDF chat analytics table:', tableCheckError.message);
      return;
    }
    
    // Get all PDF chat history without analytics entries
    const { data: missingAnalytics, error: historyError } = await supabase
      .from('pdf_chat_history')
      .select(`
        id,
        user_id,
        file_name,
        messages,
        created_at,
        updated_at,
        pdf_chat_analytics!left(id)
      `)
      .is('pdf_chat_analytics.id', null);
    
    if (historyError) {
      if (historyError.message.includes('does not exist')) {
        console.error('PDF chat history table not available. This feature requires database setup.');
        return;
      }
      console.error('Error fetching PDF chat history:', historyError);
      return;
    }
    
    if (!missingAnalytics || missingAnalytics.length === 0) {
      console.log('No missing PDF chat analytics found');
      return;
    }
    
    console.log(`Found ${missingAnalytics.length} PDF chats without analytics`);
    
    // Create analytics entries in batches
    const batchSize = 20;
    const batches = Math.ceil(missingAnalytics.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batch = missingAnalytics.slice(i * batchSize, (i + 1) * batchSize);
      const analyticsData = batch.map(item => ({
        user_id: item.user_id,
        title: item.file_name || 'PDF Analysis',
        file_name: item.file_name,
        messages_count: (item.messages?.length || 0),
        pdf_chat_history_id: item.id,
        created_at: item.created_at,
        updated_at: item.updated_at || new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('pdf_chat_analytics')
        .insert(analyticsData);
      
      if (insertError) {
        console.error(`Error inserting batch ${i+1}:`, insertError);
      } else {
        console.log(`Successfully created analytics for batch ${i+1}`);
      }
    }
    
    console.log('PDF chat analytics sync completed');
  } catch (error) {
    console.error('Error syncing PDF chat analytics:', error);
  }
};

export default syncPdfChatAnalytics; 