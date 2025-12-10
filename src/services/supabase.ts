import { createClient } from "@supabase/supabase-js";
// demo
// Get these from your Supabase project settings or use default placeholders
const supabaseUrl = localStorage.getItem("supabaseUrl") || "";
const supabaseKey = localStorage.getItem("supabaseKey") || "";

// Initialize the Supabase client only if both URL and key are available
export const supabase = (() => {
  // Check if both URL and key are available before creating client
  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  // Return a dummy client with methods that do nothing when credentials aren't set
  return {
    from: () => ({
      select: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      insert: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      update: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      delete: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
    }), // more testting // more testing
    auth: {
      signUp: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      signIn: () =>
        Promise.resolve({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      signOut: () =>
        Promise.resolve({ error: new Error("Supabase not configured") }),
    },
    // Add other commonly used methods as needed
  }; // demo
})();
//demo
// Function to save Supabase credentials to localStorage
export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem("supabaseUrl", url);
  localStorage.setItem("supabaseKey", key);
  return createClient(url, key);
};
// demo
// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    !!localStorage.getItem("supabaseUrl") &&
    !!localStorage.getItem("supabaseKey")
  );
};
