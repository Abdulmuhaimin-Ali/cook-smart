<<<<<<< HEAD

import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings or use default placeholders
const supabaseUrl = localStorage.getItem('supabaseUrl') || '';
const supabaseKey = localStorage.getItem('supabaseKey') || '';

// Initialize the Supabase client only if both URL and key are available
export const supabase = (() => {
  // Check if both URL and key are available before creating client
  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  // Return a dummy client with methods that do nothing when credentials aren't set
  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signIn: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    },
    // Add other commonly used methods as needed
  };
})();

// Function to save Supabase credentials to localStorage
export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('supabaseUrl', url);
  localStorage.setItem('supabaseKey', key);
  return createClient(url, key);
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!localStorage.getItem('supabaseUrl') && !!localStorage.getItem('supabaseKey');
};
=======
// services/supabase.ts
import * as dotenv from 'dotenv';
dotenv.config(); 
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Now you can access process.env variables
const supabaseUrl = process.env.SUPABASE_URL as string;  // Ensure type safety by asserting the type
const supabaseKey = process.env.SUPABASE_KEY as string;  // Ensure type safety

console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key:', process.env.SUPABASE_KEY);
// Create Supabase client instance
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
>>>>>>> 4d1040d (added supabase backend)
