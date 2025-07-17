// Supabase database type definitions
// These types should match your Supabase database schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          description: string | null;
          frequency: string;
          reminder_time: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          frequency: string;
          reminder_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          frequency?: string;
          reminder_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_entries: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          completed: boolean;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          completed: boolean;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          completed?: boolean;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
      };
      shared_progress: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          visibility: 'private' | 'friends' | 'public';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          visibility?: 'private' | 'friends' | 'public';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          visibility?: 'private' | 'friends' | 'public';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          notifications_enabled: boolean;
          daily_reminder_time: string | null;
          theme: 'light' | 'dark' | 'auto';
          tips_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notifications_enabled?: boolean;
          daily_reminder_time?: string | null;
          theme?: 'light' | 'dark' | 'auto';
          tips_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notifications_enabled?: boolean;
          daily_reminder_time?: string | null;
          theme?: 'light' | 'dark' | 'auto';
          tips_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience type exports
export type User = Database['public']['Tables']['users']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitEntry = Database['public']['Tables']['habit_entries']['Row'];
export type Friendship = Database['public']['Tables']['friendships']['Row'];
export type SharedProgress = Database['public']['Tables']['shared_progress']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitEntryInsert = Database['public']['Tables']['habit_entries']['Insert'];
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert'];
export type SharedProgressInsert = Database['public']['Tables']['shared_progress']['Insert'];
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type HabitUpdate = Database['public']['Tables']['habits']['Update'];
export type HabitEntryUpdate = Database['public']['Tables']['habit_entries']['Update'];
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update'];
export type SharedProgressUpdate = Database['public']['Tables']['shared_progress']['Update'];
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];