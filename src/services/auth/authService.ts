// Authentication service using Supabase Auth
import { AuthSession, AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabase/config';
import type { User } from '../supabase/database.types';

export interface AuthUser extends SupabaseUser {
  profile?: User;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, displayName } = data;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // If signup successful, create default categories
      if (authData.user) {
        await this.createDefaultCategories(authData.user.id);
      }

      return {
        user: authData.user as AuthUser,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { email, password } = data;
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // Fetch user profile
      const profile = await this.getUserProfile(authData.user.id);
      
      return {
        user: { ...authData.user, profile } as AuthUser,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Get the current user session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Fetch user profile
      const profile = await this.getUserProfile(user.id);
      
      return { ...user, profile } as AuthUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get the current session
   */
  static async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Reset password via email
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.yourapp.habitos://reset-password',
      });
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
        },
      });

      if (error) {
        return { user: null, error };
      }

      // Update the profile in the users table
      if (data.user) {
        await supabase
          .from('users')
          .update({
            display_name: updates.displayName,
            avatar_url: updates.avatarUrl,
          })
          .eq('id', data.user.id);

        const profile = await this.getUserProfile(data.user.id);
        return { user: { ...data.user, profile } as AuthUser, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Get user profile from the users table
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create default categories for new users
   */
  private static async createDefaultCategories(userId: string): Promise<void> {
    try {
      // Call the Supabase function to create default categories
      await supabase.rpc('create_default_categories', {
        user_id: userId,
      });
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}