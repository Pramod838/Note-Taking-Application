import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL on redirect
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: 'auth-notes-app-session',
    // Custom headers for JWT validation
    headers: {
      'X-Client-Info': 'auth-notes-app@1.0.0',
    },
  },
  // Global headers for all requests
  global: {
    headers: {
      'X-Client-Info': 'auth-notes-app@1.0.0',
    },
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get current JWT token
export const getCurrentJWTToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Helper function to validate JWT token
export const validateJWTToken = async (): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return !error && user !== null;
  } catch (error) {
    return false;
  }
};

// Helper function to refresh JWT token if needed
export const refreshJWTToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      throw error;
    }
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to refresh JWT token:', error);
    return null;
  }
};