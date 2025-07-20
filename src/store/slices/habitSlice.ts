import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseAuthService, FirebaseDatabaseService } from '@/services/firebase';
import { OfflineStorageService } from '@/services/storage/offlineStorage';
import { ResetStorageService } from '@/services/storage/resetStorage';
import { HabitAnalyticsService } from '@/services/analytics';
import { analyticsCache } from '@/utils/memoization';
import { getTodayLocalDate } from '@/utils/dateHelpers';
import type { Habit, HabitEntry, HabitWithCategory, Category, HabitStats, HabitStreak } from '@/types';

export interface HabitSlice {
  // State
  habits: HabitWithCategory[];
  categories: Category[];
  todaysEntries: HabitEntry[];
  habitStats: Map<string, HabitStats>;
  habitStreaks: Map<string, HabitStreak>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHabits: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTodaysEntries: () => Promise<void>;
  loadHabitStats: (habitId: string) => Promise<void>;
  loadHabitStreaks: (habitId: string) => Promise<void>;
  loadAllHabitsStats: () => Promise<void>;
  forceRefreshStreaks: () => Promise<void>;
  cleanupDuplicateCategories: () => Promise<{ success: boolean; error?: string; removedCount?: number }>;
  fixHabitColors: () => Promise<{ success: boolean; error?: string; updatedCount?: number }>;
  createHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<HabitWithCategory>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  clearError: () => void;
  backupToFirebase: () => Promise<{ success: boolean; error?: string; categoriesCount?: number; habitsCount?: number; entriesCount?: number }>;
  resetApp: () => Promise<void>;
  resetMigration: () => Promise<void>;
  completeDataMigration: () => Promise<{ success: boolean; error?: string; categoriesMigrated?: number; habitsMigrated?: number; entriesMigrated?: number; finalHabitsCount?: number }>;
  debugState: () => void;
}

export const createHabitSlice: StateCreator<HabitSlice> = (set, get) => ({
  // Initial state
  habits: [],
  categories: [],
  todaysEntries: [],
  habitStats: new Map(),
  habitStreaks: new Map(),
  isLoading: false,
  error: null,

  // Load all habits with categories - FIXED TO PREVENT DUPLICATES
  loadHabits: async () => {
    console.log('\n🔄 === STARTING LOADHABITS === 🔄');
    console.log('HabitSlice: Current habits in store:', get().habits.length);
    set({ isLoading: true, error: null });
    
    try {
      // Check if we're in Firebase-only mode (after successful migration)
      const firebaseOnlyMode = await AsyncStorage.getItem('firebase_only_mode');
      const migrationCompleted = await AsyncStorage.getItem('migration_completed');
      
      console.log('HabitSlice: Firebase-only mode:', firebaseOnlyMode);
      console.log('HabitSlice: Migration completed:', migrationCompleted);
      
      const currentUser = await FirebaseAuthService.getCurrentUser();
      console.log('HabitSlice: Current user:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'null');
      
      if (currentUser) {
        if (firebaseOnlyMode === 'true') {
          // 🔒 FIREBASE-ONLY MODE: Only load from Firebase, no migration checks
          console.log('\n🔒 === FIREBASE-ONLY MODE - NO DUPLICATES ===');
          const habits = await FirebaseDatabaseService.getHabits(currentUser.uid);
          console.log('📋 Loaded', habits.length, 'habits from Firebase only');
          console.log('📋 Habit names:', habits.map(h => h.name));
          
          set({ habits, isLoading: false });
          
          if (habits.length > 0) {
            get().loadAllHabitsStats();
          }
          
          console.log('🔒 Firebase-only loading complete - no duplicates possible');
          return;
        }
        
        // Legacy migration logic (only if not in Firebase-only mode)
        console.log('\n⚠️  LEGACY MODE: Checking for migration needs...');
        const habits = await FirebaseDatabaseService.getHabits(currentUser.uid);
        console.log('HabitSlice: Firebase habits found:', habits.length);
        
        if (habits.length === 0 && migrationCompleted !== 'true') {
          console.log('\n🚀 NO FIREBASE HABITS - RECOMMENDING COMPLETE MIGRATION');
          console.log('⚠️  Recommend calling completeDataMigration() to fix all issues');
          
          // Load offline as temporary fallback
          const offlineData = await OfflineStorageService.loadOfflineData();
          console.log('📋 Temporary offline fallback:', offlineData.habits.length, 'habits');
          set({ habits: offlineData.habits, isLoading: false });
          
          return;
        }
        
        // Firebase habits exist, use them
        console.log('\n📋 Loading existing Firebase habits:', habits.length);
        set({ habits, isLoading: false });
        
        if (habits.length > 0) {
          get().loadAllHabitsStats();
        }
        
      } else {
        // No user - use offline mode
        console.log('\n⚠️  No Firebase user, using offline mode');
        const offlineData = await OfflineStorageService.loadOfflineData();
        console.log('📋 Offline mode:', offlineData.habits.length, 'habits');
        set({ habits: offlineData.habits, isLoading: false });
        
        if (offlineData.habits.length > 0) {
          get().loadAllHabitsStats();
        }
      }
      
    } catch (error) {
      console.error('❌ Error in loadHabits:', error);
      set({ habits: [], isLoading: false, error: 'Unable to load habits' });
    }
    
    console.log('\n🔄 === LOADHABITS COMPLETE === 🔄\n');
  },

  // Load all categories
  loadCategories: async () => {
    console.log('HabitSlice: Starting loadCategories');
    
    try {
      // Try Firebase first, fall back to offline
      console.log('HabitSlice: Using Firebase for categories');
      const currentUser = await FirebaseAuthService.getCurrentUser();
      
      if (currentUser) {
        // Load from Firebase
        const categories = await FirebaseDatabaseService.getCategories(currentUser.uid);
        console.log('HabitSlice: Loaded Firebase categories:', categories.length);
        console.log('HabitSlice: Category details:', categories.map(c => ({ id: c.id, name: c.name })));
        
        // Filter out duplicates just in case
        const uniqueCategories = categories.filter((category, index, self) => 
          index === self.findIndex(c => c.id === category.id)
        );
        console.log('HabitSlice: After deduplication:', uniqueCategories.length, 'unique categories');
        set({ categories: uniqueCategories });
      } else {
        // Fallback to offline mode
        console.log('HabitSlice: No user, using offline mode for categories');
        const offlineData = await OfflineStorageService.loadOfflineData();
        console.log('HabitSlice: Loaded offline categories:', offlineData.categories.length);
        
        // Filter out duplicates just in case
        const uniqueCategories = offlineData.categories.filter((category, index, self) => 
          index === self.findIndex(c => c.id === category.id)
        );
        console.log('HabitSlice: After offline deduplication:', uniqueCategories.length, 'unique categories');
        set({ categories: uniqueCategories });
      }
    } catch (error) {
      console.error('HabitSlice: Error loading categories:', error);
      // Fallback to offline mode
      try {
        const offlineData = await OfflineStorageService.loadOfflineData();
        const uniqueCategories = offlineData.categories.filter((category, index, self) => 
          index === self.findIndex(c => c.id === category.id)
        );
        console.log('HabitSlice: Error fallback - loaded unique categories:', uniqueCategories.length);
        set({ categories: uniqueCategories });
      } catch (offlineError) {
        console.error('HabitSlice: Offline fallback failed:', offlineError);
        set({ error: 'Unable to load categories', categories: [] });
      }
    }
  },

  // Load today's habit entries - RESPECTS FIREBASE-ONLY MODE
  loadTodaysEntries: async () => {
    console.log('\n📅 === LOADING TODAY\'S ENTRIES ===');
    
    try {
      const firebaseOnlyMode = await AsyncStorage.getItem('firebase_only_mode');
      const currentUser = await FirebaseAuthService.getCurrentUser();
      console.log('Firebase-only mode:', firebaseOnlyMode);
      console.log('Current user for entries:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'null');
      
      if (currentUser) {
        // Always use Firebase if user exists (respects Firebase-only mode)
        const today = getTodayLocalDate();
        console.log('📅 Today\'s date (local):', today);
        
        console.log('🔄 Fetching habit entries from Firebase...');
        const entries = await FirebaseDatabaseService.getHabitEntries(currentUser.uid, undefined, today);
        console.log('📊 Firebase entries loaded:', entries.length, 'entries for today');
        
        // Debug: Show all entries with details
        if (entries.length > 0) {
          console.log('📝 Today\'s entry details:');
          entries.forEach((entry, index) => {
            console.log(`  ${index + 1}. Habit: ${entry.habit_id} | Date: ${entry.entry_date} | Completed: ${entry.is_completed}`);
          });
        } else {
          console.log('⚠️ No entries found for today');
          
          // In Firebase-only mode, show more debug info
          if (firebaseOnlyMode === 'true') {
            console.log('\n🔍 FIREBASE-ONLY MODE: Checking completion history...');
            const allEntries = await FirebaseDatabaseService.getHabitEntries(currentUser.uid);
            console.log('📊 Total entries for user:', allEntries.length);
            
            if (allEntries.length > 0) {
              console.log('📝 Recent completion dates:');
              const uniqueDates = [...new Set(allEntries.map(e => e.entry_date))].sort().slice(-7);
              uniqueDates.forEach(date => {
                const dateEntries = allEntries.filter(e => e.entry_date === date);
                const completed = dateEntries.filter(e => e.is_completed).length;
                console.log(`  ${date}: ${completed}/${dateEntries.length} completed`);
              });
            } else {
              console.log('❌ NO COMPLETION DATA FOUND - Migration may have failed to transfer entries');
            }
          }
        }
        
        set({ todaysEntries: entries });
      } else {
        // No user - only use offline if not in Firebase-only mode
        if (firebaseOnlyMode === 'true') {
          console.log('⚠️ Firebase-only mode but no user - clearing entries');
          set({ todaysEntries: [] });
        } else {
          console.log('⚠️ No user, using offline mode for entries');
          const entries = await OfflineStorageService.getTodaysEntriesOffline();
          console.log('📊 Loaded offline entries:', entries.length);
          set({ todaysEntries: entries });
        }
      }
    } catch (error) {
      console.error('❌ Error loading today\'s entries:', error);
      set({ error: 'Unable to load today\'s entries', todaysEntries: [] });
    }
    
    console.log('📅 === TODAY\'S ENTRIES LOADING COMPLETE ===\n');
  },

  // Create new habit
  createHabit: async (habitData) => {
    console.log('HabitSlice: Starting createHabit with data:', habitData);
    set({ isLoading: true, error: null });
    
    try {
      // Try Firebase first, fall back to offline
      console.log('HabitSlice: Using Firebase for create habit');
      const currentUser = await FirebaseAuthService.getCurrentUser();
      
      if (currentUser) {
        // Create in Firebase
        const newHabit = await FirebaseDatabaseService.createHabit(currentUser.uid, habitData);
        console.log('HabitSlice: Created Firebase habit:', newHabit);
        const currentHabits = get().habits;
        set({ 
          habits: [newHabit, ...currentHabits],
          isLoading: false 
        });
        
        // Initialize stats for the new habit
        get().loadHabitStats(newHabit.id);
        get().loadHabitStreaks(newHabit.id);
        
        return newHabit;
      } else {
        // Fallback to offline mode
        console.log('HabitSlice: No user, using offline mode for create habit');
        const offlineHabit = await OfflineStorageService.createHabitOffline(habitData);
        console.log('HabitSlice: Created offline habit:', offlineHabit);
        const currentHabits = get().habits;
        set({ 
          habits: [offlineHabit, ...currentHabits],
          isLoading: false 
        });
        
        // Initialize stats for the new habit
        get().loadHabitStats(offlineHabit.id);
        get().loadHabitStreaks(offlineHabit.id);
        
        return offlineHabit;
      }
    } catch (error) {
      console.error('HabitSlice: Error creating habit:', error);
      // Fallback to offline mode
      try {
        const offlineHabit = await OfflineStorageService.createHabitOffline(habitData);
        const currentHabits = get().habits;
        set({ 
          habits: [offlineHabit, ...currentHabits],
          isLoading: false 
        });
        return offlineHabit;
      } catch (offlineError) {
        console.error('HabitSlice: Offline fallback failed:', offlineError);
        set({ error: 'Unable to create habit', isLoading: false });
        throw offlineError;
      }
    }
  },

  // Update habit
  updateHabit: async (id, updates) => {
    console.log('HabitSlice: Starting updateHabit for id:', id);
    set({ isLoading: true, error: null });
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for update habit');
      const currentHabits = get().habits;
      const updatedHabits = currentHabits.map(habit => {
        if (habit.id === id) {
          return {
            ...habit,
            ...updates,
            updated_at: new Date().toISOString()
          };
        }
        return habit;
      });

      set({ habits: updatedHabits, isLoading: false });
      console.log('HabitSlice: Updated habit successfully');
    } catch (error) {
      console.error('HabitSlice: Error updating habit:', error);
      set({ error: 'Unable to update habit', isLoading: false });
    }
  },

  // Delete habit (soft delete)
  deleteHabit: async (id) => {
    console.log('HabitSlice: Starting deleteHabit for id:', id);
    set({ isLoading: true, error: null });
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for delete habit');
      const currentHabits = get().habits;
      const filteredHabits = currentHabits.filter(habit => habit.id !== id);
      
      // Update both store and AsyncStorage
      set({ habits: filteredHabits, isLoading: false });
      
      // Update AsyncStorage with the filtered habits
      await OfflineStorageService.updateOfflineData({ habits: filteredHabits });
      
      console.log('HabitSlice: Deleted habit successfully from both store and storage');
    } catch (error) {
      console.error('HabitSlice: Error deleting habit:', error);
      set({ error: 'Unable to delete habit', isLoading: false });
    }
  },

  // Toggle habit completion for a specific date - FIREBASE-ONLY MODE COMPATIBLE
  toggleHabitCompletion: async (habitId, date) => {
    console.log('\n✅ === TOGGLING HABIT COMPLETION ===');
    console.log('HabitSlice: Habit ID:', habitId, '| Date:', date);
    
    // 🚀 OPTIMISTIC UPDATE: Update UI immediately for fast response
    const currentEntries = get().todaysEntries;
    console.log('Current today\'s entries:', currentEntries.length);
    const existingEntry = currentEntries.find(entry => 
      entry.habit_id === habitId && entry.entry_date === date
    );
    console.log('Existing entry found:', existingEntry ? 'YES' : 'NO');
    
    let optimisticEntries;
    if (existingEntry) {
      // Toggle existing entry
      const newState = !existingEntry.is_completed;
      console.log('Toggling existing entry from', existingEntry.is_completed, 'to', newState);
      optimisticEntries = currentEntries.map(entry => 
        entry.habit_id === habitId && entry.entry_date === date
          ? { ...entry, is_completed: newState }
          : entry
      );
    } else {
      // Create new completed entry
      console.log('Creating new completed entry');
      const newEntry = {
        id: `temp_${Date.now()}`,
        habit_id: habitId,
        entry_date: date,
        is_completed: true,
        user_id: 'temp',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      optimisticEntries = [...currentEntries, newEntry];
    }
    
    // ⚡ Immediately update UI
    console.log('Setting optimistic entries:', optimisticEntries.length, 'total entries');
    set({ todaysEntries: optimisticEntries });
    
    // 🔄 Background sync - RESPECTS FIREBASE-ONLY MODE
    try {
      const firebaseOnlyMode = await AsyncStorage.getItem('firebase_only_mode');
      const currentUser = await FirebaseAuthService.getCurrentUser();
      
      if (currentUser) {
        console.log('✅ User found, using Firebase for completion toggle');
        console.log('🔒 Firebase-only mode:', firebaseOnlyMode === 'true' ? 'ENABLED' : 'DISABLED');
        
        // Use Firebase for habit completion
        await FirebaseDatabaseService.toggleHabitCompletion(currentUser.uid, habitId, date);
        console.log('✅ Firebase completion toggle successful');
        
        // Reload actual data to ensure consistency
        const today = getTodayLocalDate();
        console.log('📅 Reloading today\'s entries for date:', today);
        const entries = await FirebaseDatabaseService.getHabitEntries(currentUser.uid, undefined, today);
        console.log('📊 Reloaded entries:', entries.length, 'entries found');
        
        // Log the completion states for debugging
        const todayCompletions = entries.filter(e => e.entry_date === today && e.is_completed);
        console.log('📊 Today\'s completions:', todayCompletions.length, 'habits completed today');
        todayCompletions.forEach(entry => {
          console.log('  ✅ Completed habit:', entry.habit_id, 'on', entry.entry_date);
        });
        
        set({ todaysEntries: entries });
        
        // Update stats in background
        console.log('📈 Updating habit stats and streaks...');
        await get().loadHabitStats(habitId);
        await get().loadHabitStreaks(habitId);
        console.log('📈 Stats update complete');
        
      } else {
        // No user - only use offline if not in Firebase-only mode
        if (firebaseOnlyMode === 'true') {
          console.log('⚠️ Firebase-only mode but no user - cannot save completion');
          // Revert optimistic update
          set({ todaysEntries: currentEntries });
          set({ error: 'Please sign in to save habit completions' });
        } else {
          console.log('⚠️ No user, using offline mode for completion');
          
          // Offline mode sync
          await OfflineStorageService.toggleHabitCompletionOffline(habitId, date);
          const entries = await OfflineStorageService.getTodaysEntriesOffline();
          set({ todaysEntries: entries });
          
          // Update stats
          await get().loadHabitStats(habitId);
          await get().loadHabitStreaks(habitId);
        }
      }
      
      console.log('✅ Habit completion toggle completed successfully');
    } catch (error) {
      console.error('❌ Error in habit completion toggle:', error);
      // If everything fails, revert optimistic update
      console.log('🔄 Reverting optimistic update due to error');
      set({ todaysEntries: currentEntries });
      set({ error: 'Unable to toggle habit completion' });
    }
    
    console.log('✅ === HABIT COMPLETION TOGGLE COMPLETE ===\n');
  },

  // Load habit statistics
  loadHabitStats: async (habitId: string) => {
    try {
      console.log('HabitSlice: Loading habit stats from Firebase for habit', habitId);
      
      const user = await FirebaseAuthService.getCurrentUser();
      console.log('HabitSlice: getCurrentUser returned:', user ? { uid: user.uid, email: user.email } : 'null');
      if (!user || !user.uid) {
        console.log('HabitSlice: No user logged in or no UID, skipping stats calculation');
        return;
      }

      // Use Firebase analytics service to calculate stats
      const stats = await HabitAnalyticsService.calculateHabitStats(habitId, user.uid);
      console.log('HabitSlice: Calculated stats for habit', habitId, ':', stats);
      
      // Update the stats in store
      set(state => {
        const newStats = new Map(state.habitStats);
        newStats.set(habitId, stats);
        return { habitStats: newStats };
      });
    } catch (error) {
      console.error('Error loading habit stats:', error);
    }
  },

  // Load habit streaks
  loadHabitStreaks: async (habitId: string) => {
    try {
      console.log('HabitSlice: Loading habit streaks from Firebase for habit', habitId);
      
      const user = await FirebaseAuthService.getCurrentUser();
      console.log('HabitSlice: getCurrentUser for streaks returned:', user ? { uid: user.uid, email: user.email } : 'null');
      if (!user || !user.uid) {
        console.log('HabitSlice: No user logged in or no UID, skipping streak calculation');
        return;
      }

      // Use Firebase analytics service to calculate streaks
      const streaks = await HabitAnalyticsService.calculateStreaks(habitId, user.uid);
      console.log('HabitSlice: Calculated streaks for habit', habitId, ':', streaks);
      
      // Update the streaks in store
      set(state => {
        const newStreaks = new Map(state.habitStreaks);
        newStreaks.set(habitId, streaks);
        return { habitStreaks: newStreaks };
      });
    } catch (error) {
      console.error('Error loading habit streaks:', error);
    }
  },

  // Load stats for all habits
  loadAllHabitsStats: async () => {
    try {
      console.log('HabitSlice: Calculating real stats for all habits');
      const habits = get().habits;
      
      // Load stats for each habit individually to get real data
      for (const habit of habits) {
        await get().loadHabitStats(habit.id);
        await get().loadHabitStreaks(habit.id);
      }
      
      console.log('HabitSlice: Finished loading stats for', habits.length, 'habits');
    } catch (error) {
      console.error('Error loading all habits stats:', error);
    }
  },

  // Force refresh all streaks (clears cache)
  forceRefreshStreaks: async () => {
    try {
      console.log('🔄 HabitSlice: Force refreshing all streaks...');
      
      // Clear analytics cache to force recalculation
      HabitAnalyticsService.clearAllCache();
      
      const habits = get().habits;
      console.log('🔄 Refreshing streaks for', habits.length, 'habits');
      
      // Clear current streak data
      set({ habitStreaks: new Map(), habitStats: new Map() });
      
      // Reload all streaks and stats
      for (const habit of habits) {
        console.log('🔄 Refreshing streak for habit:', habit.name);
        await get().loadHabitStats(habit.id);
        await get().loadHabitStreaks(habit.id);
      }
      
      console.log('✅ All streaks refreshed!');
    } catch (error) {
      console.error('❌ Error force refreshing streaks:', error);
    }
  },

  // Clean up duplicate categories by name
  cleanupDuplicateCategories: async () => {
    console.log('\n🧹 === STARTING CATEGORY CLEANUP ===');
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user found');
        return { success: false, error: 'No authenticated user' };
      }
      
      const currentCategories = get().categories;
      console.log('📊 Current categories:', currentCategories.length);
      
      // Group categories by name to find duplicates
      const categoryMap = new Map<string, Category[]>();
      currentCategories.forEach(category => {
        const name = category.name;
        if (!categoryMap.has(name)) {
          categoryMap.set(name, []);
        }
        categoryMap.get(name)!.push(category);
      });
      
      console.log('📝 Category groups:');
      for (const [name, categories] of categoryMap.entries()) {
        console.log(`  ${name}: ${categories.length} entries`);
      }
      
      // Keep only the first category of each name, delete the rest
      let removedCount = 0;
      const categoriesToKeep: Category[] = [];
      const categoriesToDelete: string[] = [];
      
      for (const [name, categories] of categoryMap.entries()) {
        if (categories.length > 1) {
          console.log(`🔧 Found ${categories.length} duplicates for "${name}"`);
          // Keep the first one (by creation date or first in array)
          categoriesToKeep.push(categories[0]);
          // Mark the rest for deletion
          for (let i = 1; i < categories.length; i++) {
            categoriesToDelete.push(categories[i].id);
            removedCount++;
          }
        } else {
          // No duplicates, keep it
          categoriesToKeep.push(categories[0]);
        }
      }
      
      console.log(`🗑️  Will delete ${categoriesToDelete.length} duplicate categories`);
      console.log(`✅ Will keep ${categoriesToKeep.length} unique categories`);
      
      // Delete duplicates from Firebase
      for (const categoryId of categoriesToDelete) {
        try {
          await FirebaseDatabaseService.deleteCategory(categoryId);
          console.log(`  ✅ Deleted category: ${categoryId}`);
        } catch (error) {
          console.error(`  ❌ Failed to delete category ${categoryId}:`, error);
        }
      }
      
      // Update store with cleaned categories
      set({ categories: categoriesToKeep });
      
      console.log('🎉 Category cleanup complete!');
      console.log(`📊 Final result: ${categoriesToKeep.length} unique categories`);
      console.log('🧹 === CATEGORY CLEANUP COMPLETE ===\n');
      
      return {
        success: true,
        removedCount: removedCount
      };
      
    } catch (error) {
      console.error('❌ Category cleanup failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Fix habit colors by ensuring all habits use category colors only
  fixHabitColors: async () => {
    console.log('\n🎨 === FIXING HABIT COLORS ===');
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user found');
        return { success: false, error: 'No authenticated user' };
      }
      
      const currentHabits = get().habits;
      console.log('🎨 Checking', currentHabits.length, 'habits for color issues');
      
      let updatedCount = 0;
      
      for (const habit of currentHabits) {
        // Check if habit has a legacy color property that conflicts with category color
        if (habit.hasOwnProperty('color') && habit.color !== habit.category.color) {
          console.log(`🔧 Fixing color for habit "${habit.name}"`);
          console.log(`   Old color: ${habit.color} | Category color: ${habit.category.color}`);
          
          try {
            // Update habit in Firebase to remove the color property
            const updateData = { ...habit };
            delete updateData.color; // Remove the legacy color property
            
            await FirebaseDatabaseService.updateHabit(habit.id, updateData);
            updatedCount++;
            console.log(`   ✅ Fixed color for "${habit.name}"`);
          } catch (error) {
            console.error(`   ❌ Failed to fix color for "${habit.name}":`, error);
          }
        }
      }
      
      if (updatedCount > 0) {
        // Reload habits to reflect changes
        console.log('🔄 Reloading habits after color fixes...');
        await get().loadHabits();
      }
      
      console.log('🎨 === HABIT COLOR FIX COMPLETE ===');
      console.log(`📊 Updated ${updatedCount} habits`);
      
      return {
        success: true,
        updatedCount: updatedCount
      };
      
    } catch (error) {
      console.error('❌ Habit color fix failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      console.log('HabitSlice: Creating category:', categoryData);
      
      // Try Firebase first, fall back to offline
      const currentUser = await FirebaseAuthService.getCurrentUser();
      
      if (currentUser) {
        // Create in Firebase
        const newCategory = await FirebaseDatabaseService.createCategory(currentUser.uid, categoryData);
        console.log('HabitSlice: Created Firebase category:', newCategory);
        
        const currentCategories = get().categories;
        set({ categories: [...currentCategories, newCategory] });
      } else {
        // Fallback to offline mode
        console.log('HabitSlice: No user, using offline mode for create category');
        const offlineCategory = await OfflineStorageService.createCategoryOffline(categoryData);
        
        const currentCategories = get().categories;
        set({ categories: [...currentCategories, offlineCategory] });
      }
    } catch (error) {
      console.error('HabitSlice: Error creating category:', error);
      set({ error: (error as Error).message });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
  
  // Debug function to check current state
  debugState: () => {
    const state = get();
    console.log('\n🔍 === DEBUG STATE ===');
    console.log('Habits:', state.habits.length);
    console.log('Habit names:', state.habits.map(h => h.name));
    console.log('Today\'s entries:', state.todaysEntries.length);
    console.log('Stats Map size:', state.habitStats.size);
    console.log('Streaks Map size:', state.habitStreaks.size);
    console.log('Loading:', state.isLoading);
    console.log('Error:', state.error);
    console.log('🔍 === DEBUG STATE END ===\n');
  },

  // Manual backup function to save offline habits to Firebase
  backupToFirebase: async () => {
    console.log('HabitSlice: Starting manual backup to Firebase');
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('HabitSlice: No Firebase user for backup');
        return { success: false, error: 'No authenticated user' };
      }

      // Load current offline data
      const offlineData = await OfflineStorageService.loadOfflineData();
      console.log('HabitSlice: Backing up', offlineData.habits.length, 'habits and', offlineData.categories.length, 'categories');

      // Backup categories first
      const categoryMigrationMap = new Map(); // offline_id -> firebase_id
      for (const category of offlineData.categories) {
        try {
          const firebaseCategory = await FirebaseDatabaseService.createCategory(currentUser.uid, {
            name: category.name,
            color: category.color,
            icon: category.icon
          });
          categoryMigrationMap.set(category.id, firebaseCategory.id);
          console.log('HabitSlice: Backed up category:', category.name);
        } catch (error) {
          console.error('HabitSlice: Error backing up category:', category.name, error);
        }
      }

      // Backup habits
      let successCount = 0;
      for (const habit of offlineData.habits) {
        try {
          const firebaseCategoryId = categoryMigrationMap.get(habit.category_id);
          if (firebaseCategoryId) {
            await FirebaseDatabaseService.createHabit(currentUser.uid, {
              name: habit.name,
              description: habit.description,
              frequency: habit.frequency,
              reminder_time: habit.reminder_time,
              category_id: firebaseCategoryId,
              is_active: habit.is_active
            });
            successCount++;
            console.log('HabitSlice: Backed up habit:', habit.name);
          } else {
            console.error('HabitSlice: No Firebase category found for habit:', habit.name);
          }
        } catch (error) {
          console.error('HabitSlice: Error backing up habit:', habit.name, error);
        }
      }

      // Backup habit entries (completion history)
      let entriesCount = 0;
      for (const entry of offlineData.habitEntries) {
        try {
          // Find the corresponding Firebase habit by name
          const offlineHabit = offlineData.habits.find(h => h.id === entry.habit_id);
          if (offlineHabit) {
            // For now, we'll skip entries backup to avoid complexity
            // TODO: Implement entries backup after habit IDs are properly mapped
            console.log('HabitSlice: Skipping entry backup for now (will implement after habit ID mapping)');
          }
        } catch (error) {
          console.error('HabitSlice: Error backing up entry:', error);
        }
      }

      console.log('HabitSlice: Backup complete -', successCount, 'habits backed up to Firebase');
      return { 
        success: true, 
        categoriesCount: categoryMigrationMap.size,
        habitsCount: successCount,
        entriesCount: entriesCount 
      };

    } catch (error) {
      console.error('HabitSlice: Backup to Firebase failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset app completely (for error recovery)
  resetApp: async () => {
    console.log('HabitSlice: Resetting app completely');
    try {
      // Clear all storage
      await ResetStorageService.resetAllData();
      
      // Clear migration flag to allow re-migration
      await AsyncStorage.removeItem('migration_completed');
      console.log('HabitSlice: Migration flag cleared');
      
      // Reset store state
      set({
        habits: [],
        categories: [],
        todaysEntries: [],
        habitStats: new Map(),
        habitStreaks: new Map(),
        isLoading: false,
        error: null
      });
      
      // Reload fresh data
      await get().loadHabits();
      await get().loadCategories();
      await get().loadTodaysEntries();
      
      console.log('HabitSlice: App reset successfully');
    } catch (error) {
      console.error('HabitSlice: Error resetting app:', error);
      set({ error: 'Failed to reset app' });
    }
  },

  // COMPLETE MIGRATION FIX: Extract offline data and migrate to Firebase cleanly
  completeDataMigration: async () => {
    console.log('\n🚀 === COMPLETE DATA MIGRATION - FIXING ALL ISSUES ===');
    
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user found');
        return { success: false, error: 'No authenticated user' };
      }
      
      console.log('👤 Migrating data for user:', currentUser.uid);
      
      // Step 1: Extract ALL offline data including completion history
      console.log('\n📦 STEP 1: Extracting offline data...');
      const offlineData = await OfflineStorageService.loadOfflineData();
      
      console.log('📊 Offline data summary:');
      console.log('  - Categories:', offlineData.categories.length);
      console.log('  - Habits:', offlineData.habits.length);
      console.log('  - Habit Entries:', offlineData.habitEntries.length);
      
      // Log all completion data
      const completedEntries = offlineData.habitEntries.filter(e => e.is_completed);
      console.log('  - Completed entries:', completedEntries.length);
      
      if (completedEntries.length > 0) {
        console.log('\n📅 Completion history found:');
        const entriesByDate = {};
        completedEntries.forEach(entry => {
          if (!entriesByDate[entry.entry_date]) {
            entriesByDate[entry.entry_date] = [];
          }
          entriesByDate[entry.entry_date].push(entry.habit_id);
        });
        
        Object.keys(entriesByDate).sort().forEach(date => {
          console.log(`    ${date}: ${entriesByDate[date].length} habits completed`);
        });
      }
      
      // Step 2: COMPLETELY clear Firebase
      console.log('\n🗑️  STEP 2: Clearing ALL Firebase data...');
      
      try {
        const existingHabits = await FirebaseDatabaseService.getHabits(currentUser.uid);
        console.log('🗑️  Deleting', existingHabits.length, 'existing Firebase habits...');
        for (const habit of existingHabits) {
          await FirebaseDatabaseService.deleteHabit(habit.id);
          console.log('   ✅ Deleted:', habit.name);
        }
      } catch (error) {
        console.log('ℹ️  No existing habits to delete or error clearing:', error.message);
      }
      
      // Step 3: Clear store state completely
      console.log('\n🔄 STEP 3: Clearing store state...');
      set({
        habits: [],
        categories: [],
        todaysEntries: [],
        habitStats: new Map(),
        habitStreaks: new Map(),
        isLoading: false,
        error: null
      });
      
      // Step 4: Migrate categories
      console.log('\n📁 STEP 4: Migrating categories to Firebase...');
      const categoryMapping = new Map(); // offline_id -> firebase_id
      
      for (const category of offlineData.categories) {
        try {
          const firebaseCategory = await FirebaseDatabaseService.createCategory(currentUser.uid, {
            name: category.name,
            color: category.color,
            icon: category.icon
          });
          categoryMapping.set(category.id, firebaseCategory.id);
          console.log('   ✅ Migrated category:', category.name);
        } catch (error) {
          console.error('   ❌ Failed to migrate category:', category.name, error);
        }
      }
      
      // Step 5: Migrate habits
      console.log('\n🎯 STEP 5: Migrating habits to Firebase...');
      const habitMapping = new Map(); // offline_id -> firebase_id
      let migratedHabitsCount = 0;
      
      for (const habit of offlineData.habits) {
        try {
          const firebaseCategoryId = categoryMapping.get(habit.category_id);
          if (firebaseCategoryId) {
            const firebaseHabit = await FirebaseDatabaseService.createHabit(currentUser.uid, {
              name: habit.name,
              description: habit.description,
              frequency: habit.frequency,
              reminder_time: habit.reminder_time,
              category_id: firebaseCategoryId,
              is_active: habit.is_active
            });
            habitMapping.set(habit.id, firebaseHabit.id);
            migratedHabitsCount++;
            console.log(`   ✅ Migrated habit: ${habit.name} (${habit.id} -> ${firebaseHabit.id})`);
          } else {
            console.error(`   ❌ No Firebase category found for habit: ${habit.name}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to migrate habit: ${habit.name}`, error);
        }
      }
      
      // Step 6: Migrate ALL completion data
      console.log('\n✅ STEP 6: Migrating completion history...');
      let migratedEntriesCount = 0;
      
      for (const entry of offlineData.habitEntries) {
        try {
          const firebaseHabitId = habitMapping.get(entry.habit_id);
          if (firebaseHabitId && entry.is_completed) {
            await FirebaseDatabaseService.toggleHabitCompletion(
              currentUser.uid, 
              firebaseHabitId, 
              entry.entry_date
            );
            migratedEntriesCount++;
            console.log(`   ✅ Migrated completion: ${entry.entry_date} for habit ${firebaseHabitId}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to migrate entry: ${entry.entry_date}`, error);
        }
      }
      
      // Step 7: Mark migration complete and set FIREBASE ONLY mode
      console.log('\n🔒 STEP 7: Setting Firebase-only mode...');
      await AsyncStorage.setItem('migration_completed', 'true');
      await AsyncStorage.setItem('firebase_only_mode', 'true');
      
      // Step 8: Load clean Firebase data
      console.log('\n🔄 STEP 8: Loading clean Firebase data...');
      const finalHabits = await FirebaseDatabaseService.getHabits(currentUser.uid);
      const finalCategories = await FirebaseDatabaseService.getCategories(currentUser.uid);
      
      set({ 
        habits: finalHabits,
        categories: finalCategories,
        isLoading: false 
      });
      
      // Load today's entries
      await get().loadTodaysEntries();
      
      // Load stats for all habits
      if (finalHabits.length > 0) {
        await get().loadAllHabitsStats();
      }
      
      console.log('\n🎉 === MIGRATION COMPLETE ===');
      console.log('📊 Migration summary:');
      console.log(`   - Categories: ${categoryMapping.size} migrated`);
      console.log(`   - Habits: ${migratedHabitsCount} migrated`);
      console.log(`   - Completion entries: ${migratedEntriesCount} migrated`);
      console.log(`   - Final Firebase habits: ${finalHabits.length}`);
      console.log('🔒 App is now in Firebase-only mode (no more duplicates)');
      
      return {
        success: true,
        categoriesMigrated: categoryMapping.size,
        habitsMigrated: migratedHabitsCount,
        entriesMigrated: migratedEntriesCount,
        finalHabitsCount: finalHabits.length
      };
      
    } catch (error) {
      console.error('❌ Complete migration failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Legacy reset function (kept for compatibility)
  resetMigration: async () => {
    console.log('⚠️  Using legacy resetMigration - recommend using completeDataMigration instead');
    return get().completeDataMigration();
  },
});