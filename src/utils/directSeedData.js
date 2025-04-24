// Run this script in your browser console when logged into your application
// This will create test data directly without using RPC functions
// First, ensure you're logged in to your application
// Then open browser console (F12) and paste the entire script

const seedDirectData = async () => {
  try {
    // Create dates for the past 7 days
    const generatePastDates = (days) => {
      const dates = [];
      const now = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }
      
      return dates;
    };
    
    const dates = generatePastDates(7);
    
    // Get the current user ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.error('No user ID found. Please make sure you are logged in.');
      return;
    }
    
    console.log('Starting to seed data for user:', userId);
    
    // Insert quiz data
    console.log('Creating quizzes...');
    const quizCount = 5;
    for (let i = 0; i < quizCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      const { error } = await supabase.from('quizzes').insert({
        user_id: userId,
        title: `Test Quiz ${i + 1}`,
        score: Math.floor(Math.random() * 100),
        subject: ['Math', 'Science', 'History', 'English'][Math.floor(Math.random() * 4)],
        questions_count: Math.floor(Math.random() * 10) + 5,
        time_spent: Math.floor(Math.random() * 300) + 60,
        created_at: randomDate.toISOString()
      });
      
      if (error) {
        console.error(`Error creating quiz ${i + 1}:`, error);
      } else {
        console.log(`Created quiz ${i + 1}`);
      }
    }
    
    // Insert PDF analysis data
    console.log('Creating PDF analyses...');
    const pdfCount = 3;
    for (let i = 0; i < pdfCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      const { error } = await supabase.from('pdf_analyses').insert({
        user_id: userId,
        title: `Test PDF ${i + 1}`,
        page_count: Math.floor(Math.random() * 20) + 1,
        time_spent: Math.floor(Math.random() * 300) + 60,
        document_url: `https://example.com/pdf-${i + 1}.pdf`,
        created_at: randomDate.toISOString()
      });
      
      if (error) {
        console.error(`Error creating PDF analysis ${i + 1}:`, error);
      } else {
        console.log(`Created PDF analysis ${i + 1}`);
      }
    }
    
    // Insert Image analysis data
    console.log('Creating image analyses...');
    const imageCount = 4;
    for (let i = 0; i < imageCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      const { error } = await supabase.from('image_analyses').insert({
        user_id: userId,
        title: `Test Image ${i + 1}`,
        image_url: `https://example.com/image-${i + 1}.jpg`,
        analysis_type: ['OCR', 'Object Detection', 'Scene Analysis'][Math.floor(Math.random() * 3)],
        time_spent: Math.floor(Math.random() * 300) + 60,
        created_at: randomDate.toISOString()
      });
      
      if (error) {
        console.error(`Error creating image analysis ${i + 1}:`, error);
      } else {
        console.log(`Created image analysis ${i + 1}`);
      }
    }
    
    // Create PDF chat history and analytics
    console.log('Creating PDF chat history and analytics...');
    const pdfChatCount = 2;
    for (let i = 0; i < pdfChatCount; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      const messageCount = Math.floor(Math.random() * 10) + 3;
      
      const messages = [];
      for (let j = 0; j < messageCount; j++) {
        messages.push({
          role: j % 2 === 0 ? 'user' : 'assistant',
          content: j % 2 === 0 ? `Test question ${j/2 + 1}` : `Test answer ${(j-1)/2 + 1}`,
          timestamp: new Date(randomDate).getTime() + j * 60000
        });
      }
      
      // Create chat history
      const { data: chatData, error: chatError } = await supabase.from('pdf_chat_history').insert({
        user_id: userId,
        file_name: `Test PDF Chat ${i + 1}.pdf`,
        messages: messages,
        created_at: randomDate.toISOString(),
        updated_at: randomDate.toISOString()
      }).select('id').single();
      
      if (chatError) {
        console.error('Error creating PDF chat history:', chatError);
        continue;
      } else {
        console.log(`Created PDF chat history ${i + 1}`);
      }
      
      // The trigger should automatically create the analytics entry,
      // but we'll create it manually just in case the trigger doesn't exist
      const { error: analyticsError } = await supabase.from('pdf_chat_analytics').insert({
        user_id: userId,
        title: `Chat: Test PDF Chat ${i + 1}.pdf`,
        file_name: `Test PDF Chat ${i + 1}.pdf`,
        messages_count: messageCount,
        pdf_chat_history_id: chatData.id,
        created_at: randomDate.toISOString(),
        updated_at: randomDate.toISOString()
      });
      
      if (analyticsError) {
        console.warn('Error creating PDF chat analytics (might be duplicate if trigger worked):', analyticsError);
      } else {
        console.log(`Created PDF chat analytics ${i + 1}`);
      }
    }
    
    console.log('Data seeding complete!');
    console.log(`Created ${quizCount} quizzes, ${pdfCount} PDFs, ${imageCount} images, ${pdfChatCount} PDF chats`);
    console.log('Refresh your dashboard to see the data.');
    
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
};

// Run the seeding function
seedDirectData(); 