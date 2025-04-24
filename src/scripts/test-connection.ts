import { supabase } from '../lib/supabase';

async function testDatabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check if we're authenticated
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      return;
    }
    
    console.log('Auth session:', authData.session ? 'Active' : 'None');
    
    // Test a simple database query - getting the database tables
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Database query error:', error.message);
      if (error.code === 'PGRST301') {
        console.log('This might be a permissions issue. Make sure you are authenticated and have the right permissions.');
      }
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Query result:', data);
    
    // Get database schema
    console.log('\nDatabase tables:');
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_schema', {});
    
    if (schemaError) {
      console.log('Unable to get schema information (this is normal if the RPC function is not defined)');
    } else {
      console.log('Schema:', schemaData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testDatabaseConnection()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 