import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, validateJWTToken, refreshJWTToken } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  getJWTToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session and validate JWT
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Validate JWT token
          const isValid = await validateJWTToken();
          if (isValid) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else {
            // Try to refresh token
            const newToken = await refreshJWTToken();
            if (newToken) {
              const { data: { session: newSession } } = await supabase.auth.getSession();
              setUser(newSession?.user || null);
              setIsAuthenticated(!!newSession?.user);
            } else {
              setUser(null);
              setIsAuthenticated(false);
              toast.error('Session expired. Please log in again.');
            }
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with JWT validation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          // Validate JWT token on auth state change
          const isValid = await validateJWTToken();
          if (isValid) {
            setUser(session.user);
            setIsAuthenticated(true);
            
            if (event === 'SIGNED_IN') {
              toast.success('Successfully signed in!');
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('JWT token refreshed successfully');
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
            toast.error('Authentication failed. Please log in again.');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
          }
        }
        
        setLoading(false);
      }
    );

    // Set up automatic token refresh
    const tokenRefreshInterval = setInterval(async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at || 0;
          
          // Refresh token if it expires in the next 5 minutes
          if (expiresAt - now < 300) {
            console.log('Refreshing JWT token...');
            await refreshJWTToken();
          }
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined, // This ensures OTP flow instead of magic link
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Please check your email for the verification code');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Validate JWT token after sign in
      if (data.session?.access_token) {
        const isValid = await validateJWTToken();
        if (!isValid) {
          throw new Error('Invalid authentication token');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      // Validate JWT token after OTP verification
      if (data.session?.access_token) {
        const isValid = await validateJWTToken();
        if (!isValid) {
          throw new Error('Invalid authentication token');
        }
      }

      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }

      toast.success('Verification code sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const newToken = await refreshJWTToken();
      if (newToken) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);
        toast.success('Session refreshed successfully');
      } else {
        throw new Error('Failed to refresh session');
      }
    } catch (error: any) {
      toast.error('Failed to refresh session. Please log in again.');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getJWTToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    verifyOTP,
    signOut,
    resendOTP,
    refreshSession,
    isAuthenticated,
    getJWTToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}