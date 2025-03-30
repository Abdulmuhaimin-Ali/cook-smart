
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = localStorage.getItem('supabaseUrl') || '';
const supabaseKey = localStorage.getItem('supabaseKey') || '';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to save Supabase credentials to localStorage
export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('supabaseUrl', url);
  localStorage.setItem('supabaseKey', key);
  return createClient(url, key);
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey;
};
