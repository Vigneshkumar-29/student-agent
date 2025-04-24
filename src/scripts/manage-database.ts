import { supabase } from '../lib/supabase';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      resolve(answer);
    });
  });
};

async function manageDatabaseTasks() {
  console.log('Database Management Script');
  console.log('-----------------------------');
  
  // Check authentication status
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) {
    console.log('Not authenticated. Please sign in first.');
    const email = await prompt('Email: ');
    const password = await prompt('Password: ');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Authentication failed:', error.message);
      readline.close();
      return;
    }
    console.log('Successfully signed in.');
  } else {
    console.log(`Currently signed in as: ${authData.session.user.email}`);
  }
  
  // Main menu
  while (true) {
    console.log('\nAvailable Actions:');
    console.log('1. View Quiz Attempts');
    console.log('2. View User Profile');
    console.log('3. Delete Quiz Attempt');
    console.log('4. View Database Stats');
    console.log('5. Sign Out');
    console.log('6. Exit');
    
    const choice = await prompt('Select an action (1-6): ');
    
    switch (choice) {
      case '1':
        await viewQuizAttempts();
        break;
      case '2':
        await viewUserProfile();
        break;
      case '3':
        await deleteQuizAttempt();
        break;
      case '4':
        await viewDatabaseStats();
        break;
      case '5':
        await signOut();
        break;
      case '6':
        console.log('Exiting...');
        readline.close();
        return;
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
}

async function viewQuizAttempts() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log('Not authenticated. Please sign in first.');
      return;
    }
    
    const userId = session.session.user.id;
    console.log(`Fetching quiz attempts for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching quiz attempts:', error.message);
      return;
    }
    
    if (data.length === 0) {
      console.log('No quiz attempts found.');
      return;
    }
    
    console.log(`Found ${data.length} quiz attempts:`);
    data.forEach((attempt, index) => {
      console.log(`\n[${index + 1}] Quiz Attempt ID: ${attempt.id}`);
      console.log(`  Article: ${attempt.article_title}`);
      console.log(`  Score: ${attempt.score}%`);
      console.log(`  Questions: ${attempt.total_questions}`);
      console.log(`  Correct Answers: ${attempt.correct_answers}`);
      console.log(`  Date: ${new Date(attempt.created_at).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function viewUserProfile() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log('Not authenticated. Please sign in first.');
      return;
    }
    
    const userId = session.session.user.id;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error.message);
      return;
    }
    
    console.log('\nUser Profile:');
    console.log(`  ID: ${data.id}`);
    console.log(`  Email: ${data.email}`);
    console.log(`  Name: ${data.name || 'Not set'}`);
    console.log(`  Created: ${new Date(data.created_at).toLocaleString()}`);
    console.log(`  Updated: ${new Date(data.updated_at).toLocaleString()}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function deleteQuizAttempt() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log('Not authenticated. Please sign in first.');
      return;
    }
    
    // First show attempts so user can choose one
    await viewQuizAttempts();
    
    const quizId = await prompt('\nEnter the Quiz Attempt ID to delete (or press Enter to cancel): ');
    if (!quizId) {
      console.log('Operation cancelled.');
      return;
    }
    
    const confirmation = await prompt(`Are you sure you want to delete quiz attempt ${quizId}? (yes/no): `);
    if (confirmation.toLowerCase() !== 'yes') {
      console.log('Deletion cancelled.');
      return;
    }
    
    const { error } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('id', quizId)
      .eq('user_id', session.session.user.id);
      
    if (error) {
      console.error('Error deleting quiz attempt:', error.message);
      return;
    }
    
    console.log(`Quiz attempt ${quizId} has been deleted.`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function viewDatabaseStats() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log('Not authenticated. Please sign in first.');
      return;
    }
    
    // Get total count of quiz attempts
    const { count: totalQuizzes, error: countError } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting quiz attempts:', countError.message);
    } else {
      console.log(`\nTotal Quiz Attempts in Database: ${totalQuizzes}`);
    }
    
    // Get user's quiz stats
    const userId = session.session.user.id;
    const { data: userQuizzes, error: userQuizError } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId);
      
    if (userQuizError) {
      console.error('Error fetching user quiz stats:', userQuizError.message);
    } else if (userQuizzes.length > 0) {
      const avgScore = userQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userQuizzes.length;
      console.log(`Your Quiz Attempts: ${userQuizzes.length}`);
      console.log(`Your Average Score: ${avgScore.toFixed(1)}%`);
    } else {
      console.log('You have not completed any quizzes yet.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      console.log('Successfully signed out.');
    }
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
  }
}

// Run the script
manageDatabaseTasks()
  .catch(err => {
    console.error('Script failed:', err);
    readline.close();
  }); 