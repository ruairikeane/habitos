// Supabase configuration and client setup
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Secure storage adapter for Expo
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client with React Native configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
    },
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  CATEGORIES: 'categories', 
  HABITS: 'habits',
  HABIT_ENTRIES: 'habit_entries',
  FRIENDSHIPS: 'friendships',
  SHARED_PROGRESS: 'shared_progress',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Supabase configuration helper
export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: true, // We have a real Supabase URL configured
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const config = getSupabaseConfig();
  return config.isConfigured && config.url && config.anonKey;
};