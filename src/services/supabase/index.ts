// Supabase service exports
export { supabase, TABLES, getSupabaseConfig, isSupabaseConfigured } from './config';
export { SupabaseConnectionTester, RetryHelper } from './connectionTest';
export type { Database } from './database.types';
export type {
  User,
  Category,
  Habit,
  HabitEntry,
  Friendship,
  SharedProgress,
  UserPreferences,
  UserInsert,
  CategoryInsert,
  HabitInsert,
  HabitEntryInsert,
  FriendshipInsert,
  SharedProgressInsert,
  UserPreferencesInsert,
  UserUpdate,
  CategoryUpdate,
  HabitUpdate,
  HabitEntryUpdate,
  FriendshipUpdate,
  SharedProgressUpdate,
  UserPreferencesUpdate,
} from './database.types';