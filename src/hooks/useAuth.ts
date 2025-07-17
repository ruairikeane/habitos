// Authentication hooks using Supabase Auth
import { useState, useEffect } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { AuthService, type AuthUser, type SignUpData, type SignInData } from '@/services/auth';

export interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { displayName?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        const currentSession = await AuthService.getCurrentSession();
        
        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        setSession(session);
        
        if (session?.user) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      const { user, error } = await AuthService.signUp(data);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (user) {
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setLoading(true);
      const { user, error } = await AuthService.signIn(data);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (user) {
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await AuthService.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await AuthService.resetPassword(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const updateProfile = async (updates: { displayName?: string; avatarUrl?: string }) => {
    try {
      setLoading(true);
      const { user: updatedUser, error } = await AuthService.updateProfile(updates);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (updatedUser) {
        setUser(updatedUser);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
}