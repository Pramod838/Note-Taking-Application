import { supabase } from './supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Helper function to get current user session and validate JWT
const getAuthenticatedSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  if (!session || !session.access_token) {
    throw new Error('No valid session found. Please log in again.');
  }
  
  if (!session.user) {
    throw new Error('User not authenticated. Please log in again.');
  }
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    throw new Error('Session expired. Please log in again.');
  }
  
  return session;
};

// Helper function to make authenticated requests with explicit JWT validation
const makeAuthenticatedRequest = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<T> => {
  // Validate session and JWT token before making request
  const session = await getAuthenticatedSession();
  
  // Ensure the request includes the JWT token
  const { data, error } = await operation();
  
  if (error) {
    // Handle specific authentication errors
    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
      throw new Error('Access denied. You can only access your own notes.');
    }
    
    throw new Error(error.message || 'An error occurred while processing your request.');
  }
  
  if (!data) {
    throw new Error('No data returned from the server.');
  }
  
  return data;
};

export const notesApi = {
  async getNotes(): Promise<Note[]> {
    return makeAuthenticatedRequest(async () => {
      // Explicitly validate JWT before making request
      const session = await getAuthenticatedSession();
      
      return await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
    });
  },

  async createNote(title: string, content: string): Promise<Note> {
    // Validate input
    if (!title.trim()) {
      throw new Error('Note title is required.');
    }
    
    if (title.length > 100) {
      throw new Error('Note title must be less than 100 characters.');
    }
    
    if (content.length > 10000) {
      throw new Error('Note content must be less than 10,000 characters.');
    }

    return makeAuthenticatedRequest(async () => {
      // Explicitly validate JWT and get user ID
      const session = await getAuthenticatedSession();
      
      return await supabase
        .from('notes')
        .insert([{ 
          title: title.trim(), 
          content: content.trim(),
          user_id: session.user.id // Explicitly set user_id with JWT user
        }])
        .select()
        .single();
    });
  },

  async updateNote(id: string, title: string, content: string): Promise<Note> {
    // Validate input
    if (!id) {
      throw new Error('Note ID is required.');
    }
    
    if (!title.trim()) {
      throw new Error('Note title is required.');
    }
    
    if (title.length > 100) {
      throw new Error('Note title must be less than 100 characters.');
    }
    
    if (content.length > 10000) {
      throw new Error('Note content must be less than 10,000 characters.');
    }

    return makeAuthenticatedRequest(async () => {
      // Explicitly validate JWT and get user ID
      const session = await getAuthenticatedSession();
      
      return await supabase
        .from('notes')
        .update({ 
          title: title.trim(), 
          content: content.trim(), 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', session.user.id) // Ensure user can only update their own notes
        .select()
        .single();
    });
  },

  async deleteNote(id: string): Promise<void> {
    // Validate input
    if (!id) {
      throw new Error('Note ID is required.');
    }

    await makeAuthenticatedRequest(async () => {
      // Explicitly validate JWT and get user ID
      const session = await getAuthenticatedSession();
      
      const result = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id); // Ensure user can only delete their own notes
      
      return { data: null, error: result.error };
    });
  },

  // New method to verify note ownership before operations
  async verifyNoteOwnership(noteId: string): Promise<boolean> {
    try {
      const session = await getAuthenticatedSession();
      
      const { data, error } = await supabase
        .from('notes')
        .select('user_id')
        .eq('id', noteId)
        .eq('user_id', session.user.id)
        .single();
      
      return !error && data !== null;
    } catch (error) {
      return false;
    }
  },

  // Method to get current user info from JWT
  async getCurrentUser() {
    const session = await getAuthenticatedSession();
    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.user_metadata?.full_name,
      createdAt: session.user.created_at,
      lastSignIn: session.user.last_sign_in_at,
    };
  },
};