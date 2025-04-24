import { supabase } from '../lib/supabase';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function authenticateWithSupabase() {
  console.log('Supabase Authentication Script');
  console.log('-----------------------------');
  console.log('This script will authenticate with Supabase.');
  
  // Get email
  const email = await new Promise<string>(resolve => {
    readline.question('Email: ', (answer: string) => {
      resolve(answer);
    });
  });
  
  // Get password
  const password = await new Promise<string>(resolve => {
    readline.question('Password: ', (answer: string) => {
      resolve(answer);
    });
  });
  
  try {
    console.log('Attempting to sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error.message);
      return;
    }
    
    console.log('Successfully authenticated!');
    console.log('User:', data.user?.email);
    console.log('Session expires at:', new Date(data.session?.expires_at || 0).toLocaleString());
    
    // Test a simple query to verify we can access data
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .limit(5);
      
    if (quizError) {
      console.error('Database query error:', quizError.message);
    } else {
      console.log(`Successfully retrieved ${quizData.length} quiz attempts`);
      if (quizData.length > 0) {
        console.log('First quiz attempt:', quizData[0]);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    readline.close();
  }
}

// Run the authentication script
authenticateWithSupabase()
  .then(() => console.log('Authentication process completed'))
  .catch(err => console.error('Authentication process failed:', err)); 