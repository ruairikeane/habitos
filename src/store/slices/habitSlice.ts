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
  forceLearningColor: () => Promise<{ success: boolean; error?: string; updatedCount?: number }>;
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
  oneTimeLearningFix: () => Promise<void>;
  comprehensiveCategoryDebug: () => Promise<{ success: boolean; debugInfo: any; fixes?: any; error?: string }>;
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
      const currentCategories = get().categories;
      console.log('🎨 Checking', currentHabits.length, 'habits for color issues');
      console.log('📁 Available categories:', currentCategories.map(c => `${c.name}: ${c.color}`));
      
      let updatedCount = 0;
      
      for (const habit of currentHabits) {
        console.log(`\n🔍 Checking habit: "${habit.name}"`);
        console.log(`   Category: ${habit.category.name} (${habit.category.color})`);
        console.log(`   Habit has color property: ${habit.hasOwnProperty('color') ? habit.color : 'NO'}`);
        
        let needsUpdate = false;
        const updateData = { ...habit };
        
        // Check 1: Remove any legacy color property on the habit
        if (habit.hasOwnProperty('color')) {
          console.log(`   🧹 Removing legacy color property: ${habit.color}`);
          delete updateData.color;
          needsUpdate = true;
        }
        
        // Check 2: Ensure category color is correct (Learning should be #8FA4B2)
        if (habit.category.name === 'Learning' && habit.category.color !== '#8FA4B2') {
          console.log(`   🔧 Learning category has wrong color: ${habit.category.color} should be #8FA4B2`);
          // This would require updating the category itself, not the habit
          console.log(`   ⚠️ Need to fix Learning category color in database`);
        }
        
        if (needsUpdate) {
          try {
            console.log(`   🔄 Updating habit "${habit.name}" in Firebase...`);
            await FirebaseDatabaseService.updateHabit(habit.id, updateData);
            updatedCount++;
            console.log(`   ✅ Fixed habit "${habit.name}"`);
          } catch (error) {
            console.error(`   ❌ Failed to fix habit "${habit.name}":`, error);
          }
        } else {
          console.log(`   ✅ Habit "${habit.name}" already correct`);
        }
      }
      
      // Check for Learning category color specifically
      const learningCategory = currentCategories.find(c => c.name === 'Learning');
      if (learningCategory && learningCategory.color !== '#8FA4B2') {
        console.log(`\n🔧 FIXING LEARNING CATEGORY COLOR`);
        console.log(`   Current: ${learningCategory.color}`);
        console.log(`   Should be: #8FA4B2`);
        
        try {
          await FirebaseDatabaseService.updateCategory(learningCategory.id, { 
            ...learningCategory, 
            color: '#8FA4B2' 
          });
          console.log(`   ✅ Fixed Learning category color`);
          updatedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to fix Learning category:`, error);
        }
      }
      
      if (updatedCount > 0) {
        // Reload both habits and categories to reflect changes
        console.log('🔄 Reloading habits and categories after color fixes...');
        await get().loadCategories();
        await get().loadHabits();
      }
      
      console.log('🎨 === HABIT COLOR FIX COMPLETE ===');
      console.log(`📊 Updated ${updatedCount} items`);
      
      return {
        success: true,
        updatedCount: updatedCount
      };
      
    } catch (error) {
      console.error('❌ Habit color fix failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Force Learning category to correct color - aggressive fix
  forceLearningColor: async () => {
    console.log('\n🔧 === FORCE LEARNING COLOR FIX ===');
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user found');
        return { success: false, error: 'No authenticated user' };
      }
      
      const currentCategories = get().categories;
      const currentHabits = get().habits;
      console.log('🔧 Starting aggressive Learning color fix...');
      console.log('📊 Categories:', currentCategories.length, 'Habits:', currentHabits.length);
      
      let updatedCount = 0;
      
      // Step 1: Find ALL Learning categories and force them to correct color
      const learningCategories = currentCategories.filter(c => 
        c.name.toLowerCase().includes('learning')
      );
      
      console.log(`📚 Found ${learningCategories.length} Learning categories`);
      learningCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name}: ${cat.color} (ID: ${cat.id})`);
      });
      
      for (const category of learningCategories) {
        console.log(`\n🔧 FORCING category "${category.name}" to #8FA4B2`);
        console.log(`   Current color: ${category.color}`);
        
        try {
          await FirebaseDatabaseService.updateCategory(category.id, { 
            color: '#8FA4B2' 
          });
          console.log(`   ✅ Updated category "${category.name}" to #8FA4B2`);
          updatedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to update category "${category.name}":`, error);
        }
      }
      
      // Step 2: Find ALL Learning habits and remove any color properties
      const learningHabits = currentHabits.filter(h => 
        h.category.name.toLowerCase().includes('learning')
      );
      
      console.log(`\n🎯 Found ${learningHabits.length} Learning habits`);
      learningHabits.forEach((habit, index) => {
        console.log(`  ${index + 1}. "${habit.name}" (Category: ${habit.category.name})`);
        console.log(`     Category color: ${habit.category.color}`);
        console.log(`     Habit has color: ${habit.hasOwnProperty('color') ? habit.color : 'NO'}`);
      });
      
      for (const habit of learningHabits) {
        let needsUpdate = false;
        const updateData = { ...habit };
        
        if (habit.hasOwnProperty('color')) {
          console.log(`\n🧹 REMOVING color property from habit "${habit.name}"`);
          console.log(`   Removing color: ${habit.color}`);
          delete updateData.color;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          try {
            await FirebaseDatabaseService.updateHabit(habit.id, updateData);
            console.log(`   ✅ Updated habit "${habit.name}"`);
            updatedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to update habit "${habit.name}":`, error);
          }
        } else {
          console.log(`   ✅ Habit "${habit.name}" already clean`);
        }
      }
      
      // Step 3: Force reload all data
      console.log('\n🔄 FORCE RELOADING all data...');
      await get().loadCategories();
      await get().loadHabits();
      await get().loadTodaysEntries();
      
      console.log('🔧 === FORCE LEARNING COLOR FIX COMPLETE ===');
      console.log(`📊 Total updates: ${updatedCount}`);
      
      return {
        success: true,
        updatedCount: updatedCount
      };
      
    } catch (error) {
      console.error('❌ Force Learning color fix failed:', error);
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
    
    // DEBUG: Check Learning category and habits specifically
    console.log('\n🎨 === LEARNING CATEGORY DEBUG ===');
    const categories = state.categories;
    const habits = state.habits;
    
    console.log('📁 All categories:');
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name}: ${cat.color} (ID: ${cat.id})`);
    });
    
    const learningCategories = categories.filter(c => c.name.toLowerCase().includes('learning'));
    console.log(`\n📚 Learning categories found: ${learningCategories.length}`);
    learningCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name}: ${cat.color} (ID: ${cat.id})`);
    });
    
    const learningHabits = habits.filter(h => h.category.name.toLowerCase().includes('learning'));
    console.log(`\n🎯 Learning habits found: ${learningHabits.length}`);
    learningHabits.forEach((habit, index) => {
      console.log(`  ${index + 1}. "${habit.name}"`);
      console.log(`     Category: ${habit.category.name} (${habit.category.color})`);
      console.log(`     Habit has color: ${habit.hasOwnProperty('color') ? habit.color : 'NO'}`);
      console.log(`     Category ID: ${habit.category.id}`);
    });
    
    console.log('🎨 === LEARNING DEBUG END ===');
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

  // ONE-TIME FIX: Direct Learning category color correction
  oneTimeLearningFix: async () => {
    console.log('\n🎯 === ONE-TIME LEARNING COLOR FIX ===');
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return;
      }

      // Get all categories directly from Firebase
      const allCategories = await FirebaseDatabaseService.getCategories(currentUser.uid);
      console.log('📁 Total categories in Firebase:', allCategories.length);
      
      // Find Learning categories
      const learningCategories = allCategories.filter(cat => 
        cat.name.toLowerCase() === 'learning'
      );
      console.log('📚 Learning categories found:', learningCategories.length);
      
      learningCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. Learning category ID: ${cat.id}, Color: ${cat.color}`);
      });

      // Force update ALL Learning categories to correct color
      for (const category of learningCategories) {
        console.log(`🔧 Updating Learning category ${category.id} to #8FA4B2`);
        await FirebaseDatabaseService.updateCategory(category.id, {
          color: '#8FA4B2'
        });
        console.log(`✅ Updated Learning category ${category.id}`);
      }

      // If no Learning category exists, create one
      if (learningCategories.length === 0) {
        console.log('➕ No Learning category found, creating one...');
        await FirebaseDatabaseService.createCategory(currentUser.uid, {
          name: 'Learning',
          color: '#8FA4B2',
          icon: 'book'
        });
        console.log('✅ Created Learning category with correct color');
      }

      // Reload data
      await get().loadCategories();
      await get().loadHabits();
      
      console.log('🎯 === ONE-TIME LEARNING FIX COMPLETE ===\n');
      console.log('✅ Learning category should now be #8FA4B2');
    } catch (error) {
      console.error('❌ One-time Learning fix failed:', error);
    }
  },

  // COMPREHENSIVE CATEGORY DEBUGGING AND FIX FUNCTION
  comprehensiveCategoryDebug: async () => {
    console.log('\n🔍 === COMPREHENSIVE CATEGORY DEBUGGING ===');
    
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user found');
        return { success: false, debugInfo: null, error: 'No authenticated user' };
      }
      
      console.log('👤 Debugging for user:', currentUser.uid);
      
      // Step 1: Get fresh data from Firebase
      console.log('\n📦 STEP 1: Loading fresh data from Firebase...');
      const firebaseCategories = await FirebaseDatabaseService.getCategories(currentUser.uid);
      const firebaseHabits = await FirebaseDatabaseService.getHabits(currentUser.uid);
      
      console.log('📊 Firebase data loaded:');
      console.log(`   Categories: ${firebaseCategories.length}`);
      console.log(`   Habits: ${firebaseHabits.length}`);
      
      // Step 2: Analyze categories
      console.log('\n📁 STEP 2: Category Analysis...');
      console.log('All categories in Firebase:');
      const categoryMap = new Map();
      firebaseCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. "${cat.name}" | Color: ${cat.color} | ID: ${cat.id}`);
        categoryMap.set(cat.id, cat);
      });
      
      // Check for Learning category specifically
      const learningCategories = firebaseCategories.filter(c => 
        c.name.toLowerCase() === 'learning'
      );
      console.log(`\n📚 Learning categories found: ${learningCategories.length}`);
      
      if (learningCategories.length === 0) {
        console.log('❌ NO LEARNING CATEGORY FOUND - This is likely the problem!');
      } else {
        learningCategories.forEach((cat, index) => {
          console.log(`  ${index + 1}. ID: ${cat.id} | Color: ${cat.color} | Name: "${cat.name}"`);
          if (cat.color !== '#8FA4B2') {
            console.log(`     ⚠️  WRONG COLOR: Expected #8FA4B2, got ${cat.color}`);
          } else {
            console.log(`     ✅ Correct color: ${cat.color}`);
          }
        });
      }
      
      // Step 3: Analyze habits and their category references
      console.log('\n🎯 STEP 3: Habit Category Analysis...');
      const habitIssues = [];
      const learningHabits = [];
      
      firebaseHabits.forEach((habit, index) => {
        console.log(`\n${index + 1}. Habit: "${habit.name}"`);
        console.log(`   Category ID: ${habit.category_id}`);
        console.log(`   Category Name: ${habit.category.name}`);
        console.log(`   Category Color: ${habit.category.color}`);
        
        // Check if category ID exists in Firebase
        const actualCategory = categoryMap.get(habit.category_id);
        if (!actualCategory) {
          console.log(`   ❌ INVALID CATEGORY ID: ${habit.category_id} not found in Firebase!`);
          habitIssues.push({
            habitId: habit.id,
            habitName: habit.name,
            issue: 'invalid_category_id',
            invalidCategoryId: habit.category_id,
            embeddedCategory: habit.category
          });
        } else {
          console.log(`   ✅ Valid category ID exists in Firebase`);
          
          // Check if embedded category data matches Firebase category
          if (actualCategory.name !== habit.category.name) {
            console.log(`   ⚠️  NAME MISMATCH: Firebase="${actualCategory.name}", Embedded="${habit.category.name}"`);
            habitIssues.push({
              habitId: habit.id,
              habitName: habit.name,
              issue: 'category_name_mismatch',
              firebaseCategory: actualCategory,
              embeddedCategory: habit.category
            });
          }
          
          if (actualCategory.color !== habit.category.color) {
            console.log(`   ⚠️  COLOR MISMATCH: Firebase="${actualCategory.color}", Embedded="${habit.category.color}"`);
            habitIssues.push({
              habitId: habit.id,
              habitName: habit.name,
              issue: 'category_color_mismatch',
              firebaseCategory: actualCategory,
              embeddedCategory: habit.category
            });
          }
        }
        
        // Collect Learning habits
        if (habit.category.name.toLowerCase() === 'learning') {
          learningHabits.push(habit);
        }
      });
      
      console.log(`\n📋 ANALYSIS SUMMARY:`);
      console.log(`   Total habits analyzed: ${firebaseHabits.length}`);
      console.log(`   Habits with issues: ${habitIssues.length}`);
      console.log(`   Learning habits found: ${learningHabits.length}`);
      
      // Step 4: Detailed issue reporting
      console.log('\n🚨 STEP 4: Issue Details...');
      if (habitIssues.length > 0) {
        console.log('Issues found:');
        habitIssues.forEach((issue, index) => {
          console.log(`\n  ${index + 1}. "${issue.habitName}" (${issue.habitId})`);
          console.log(`     Issue: ${issue.issue}`);
          if (issue.invalidCategoryId) {
            console.log(`     Invalid Category ID: ${issue.invalidCategoryId}`);
            console.log(`     Embedded Category: ${JSON.stringify(issue.embeddedCategory, null, 2)}`);
          }
          if (issue.firebaseCategory && issue.embeddedCategory) {
            console.log(`     Firebase Category: ${JSON.stringify(issue.firebaseCategory, null, 2)}`);
            console.log(`     Embedded Category: ${JSON.stringify(issue.embeddedCategory, null, 2)}`);
          }
        });
      } else {
        console.log('✅ No habit category issues found!');
      }
      
      // Step 5: Learning habits specific analysis
      console.log('\n📚 STEP 5: Learning Habits Analysis...');
      if (learningHabits.length > 0) {
        console.log('Learning habits details:');
        learningHabits.forEach((habit, index) => {
          console.log(`\n  ${index + 1}. "${habit.name}"`);
          console.log(`     Habit ID: ${habit.id}`);
          console.log(`     Category ID: ${habit.category_id}`);
          console.log(`     Category Name: ${habit.category.name}`);
          console.log(`     Category Color: ${habit.category.color}`);
          console.log(`     Expected Color: #8FA4B2`);
          console.log(`     Color Match: ${habit.category.color === '#8FA4B2' ? '✅' : '❌'}`);
        });
      } else {
        console.log('⚠️  No Learning habits found');
      }
      
      // Prepare debug info object
      const debugInfo = {
        userId: currentUser.uid,
        categories: firebaseCategories.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon
        })),
        habits: firebaseHabits.map(h => ({
          id: h.id,
          name: h.name,
          categoryId: h.category_id,
          embeddedCategory: h.category
        })),
        learningCategories: learningCategories,
        learningHabits: learningHabits.map(h => ({
          id: h.id,
          name: h.name,
          categoryId: h.category_id,
          categoryColor: h.category.color
        })),
        issues: habitIssues,
        summary: {
          totalCategories: firebaseCategories.length,
          totalHabits: firebaseHabits.length,
          learningCategoriesCount: learningCategories.length,
          learningHabitsCount: learningHabits.length,
          issuesFound: habitIssues.length
        }
      };
      
      // Step 6: Auto-fix common issues
      console.log('\n🔧 STEP 6: Attempting auto-fixes...');
      const fixes = {
        learningCategoryFixed: false,
        habitCategoryLinksFixed: 0,
        newLearningCategoryCreated: false
      };
      
      // Fix 1: Ensure Learning category exists and has correct color
      if (learningCategories.length === 0) {
        console.log('🔧 Creating missing Learning category...');
        try {
          const newLearningCategory = await FirebaseDatabaseService.createCategory(currentUser.uid, {
            name: 'Learning',
            color: '#8FA4B2',
            icon: 'book'
          });
          console.log('✅ Created Learning category:', newLearningCategory.id);
          fixes.newLearningCategoryCreated = true;
          fixes.learningCategoryFixed = true;
        } catch (error) {
          console.error('❌ Failed to create Learning category:', error);
        }
      } else {
        // Fix existing Learning category color
        for (const learningCat of learningCategories) {
          if (learningCat.color !== '#8FA4B2') {
            console.log(`🔧 Fixing Learning category color: ${learningCat.color} -> #8FA4B2`);
            try {
              await FirebaseDatabaseService.updateCategory(learningCat.id, {
                color: '#8FA4B2'
              });
              console.log('✅ Fixed Learning category color');
              fixes.learningCategoryFixed = true;
            } catch (error) {
              console.error('❌ Failed to fix Learning category color:', error);
            }
          }
        }
      }
      
      // Fix 2: Fix habits with invalid category IDs
      const invalidCategoryHabits = habitIssues.filter(issue => issue.issue === 'invalid_category_id');
      for (const issue of invalidCategoryHabits) {
        console.log(`🔧 Fixing invalid category ID for habit "${issue.habitName}"`);
        
        // Special case: Detect if this is a Learning habit based on name
        const habitName = issue.habitName.toLowerCase();
        const isLearningHabit = habitName.includes('study') || 
                               habitName.includes('learn') || 
                               habitName.includes('flashcard') || 
                               habitName.includes('language') ||
                               habitName.includes('read') ||
                               habitName.includes('book');
        
        let targetCategory = null;
        
        // If it's a Learning habit, use the Learning category
        if (isLearningHabit) {
          targetCategory = firebaseCategories.find(cat => cat.name.toLowerCase() === 'learning');
          if (targetCategory) {
            console.log(`   🎯 Detected Learning habit - using Learning category: ${targetCategory.name} (${targetCategory.id})`);
          }
        }
        
        // Fallback: Try to find a matching category by name
        if (!targetCategory) {
          targetCategory = firebaseCategories.find(cat => 
            cat.name.toLowerCase() === issue.embeddedCategory.name.toLowerCase()
          );
        }
        
        if (targetCategory) {
          console.log(`   Found target category: ${targetCategory.name} (${targetCategory.id})`);
          try {
            await FirebaseDatabaseService.updateHabit(issue.habitId, {
              category_id: targetCategory.id
            });
            console.log(`   ✅ Fixed category link for "${issue.habitName}"`);
            fixes.habitCategoryLinksFixed++;
          } catch (error) {
            console.error(`   ❌ Failed to fix category link for "${issue.habitName}":`, error);
          }
        } else {
          console.log(`   ⚠️  No matching category found for "${issue.embeddedCategory.name}"`);
        }
      }
      
      // Step 7: Reload data after fixes
      if (fixes.learningCategoryFixed || fixes.habitCategoryLinksFixed > 0 || fixes.newLearningCategoryCreated) {
        console.log('\n🔄 STEP 7: Reloading data after fixes...');
        await get().loadCategories();
        await get().loadHabits();
        await get().loadTodaysEntries();
        console.log('✅ Data reloaded');
      }
      
      console.log('\n🎉 === COMPREHENSIVE DEBUGGING COMPLETE ===');
      console.log('📊 Results Summary:');
      console.log(`   Categories analyzed: ${firebaseCategories.length}`);
      console.log(`   Habits analyzed: ${firebaseHabits.length}`);
      console.log(`   Issues found: ${habitIssues.length}`);
      console.log(`   Learning categories: ${learningCategories.length}`);
      console.log(`   Learning habits: ${learningHabits.length}`);
      console.log('🔧 Fixes Applied:');
      console.log(`   Learning category fixed: ${fixes.learningCategoryFixed}`);
      console.log(`   New Learning category created: ${fixes.newLearningCategoryCreated}`);
      console.log(`   Habit category links fixed: ${fixes.habitCategoryLinksFixed}`);
      
      return {
        success: true,
        debugInfo: debugInfo,
        fixes: fixes
      };
      
    } catch (error) {
      console.error('❌ Comprehensive category debug failed:', error);
      return { 
        success: false, 
        debugInfo: null, 
        error: error.message 
      };
    }
  },
});