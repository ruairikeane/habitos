import { StateCreator } from 'zustand';
import { supabase } from '@/services/supabase';
import { OfflineStorageService } from '@/services/storage/offlineStorage';
import { ResetStorageService } from '@/services/storage/resetStorage';
import { HabitAnalyticsService } from '@/services/analytics';
import { analyticsCache } from '@/utils/memoization';
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
  createHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<HabitWithCategory>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  clearError: () => void;
  resetApp: () => Promise<void>;
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

  // Load all habits with categories
  loadHabits: async () => {
    console.log('HabitSlice: Starting loadHabits');
    set({ isLoading: true, error: null });
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode');
      const offlineData = await OfflineStorageService.loadOfflineData();
      console.log('HabitSlice: Loaded offline data:', offlineData.habits.length, 'habits');
      set({ habits: offlineData.habits, isLoading: false });
      
      // Load stats for all habits
      if (offlineData.habits.length > 0) {
        get().loadAllHabitsStats();
      }
    } catch (error) {
      console.error('HabitSlice: Error loading offline data:', error);
      set({ habits: [], isLoading: false, error: 'Unable to load habits' });
    }
  },

  // Load all categories
  loadCategories: async () => {
    console.log('HabitSlice: Starting loadCategories');
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for categories');
      const offlineData = await OfflineStorageService.loadOfflineData();
      console.log('HabitSlice: Loaded offline categories:', offlineData.categories.length);
      set({ categories: offlineData.categories });
    } catch (error) {
      console.error('HabitSlice: Error loading offline categories:', error);
      set({ error: 'Unable to load categories', categories: [] });
    }
  },

  // Load today's habit entries
  loadTodaysEntries: async () => {
    console.log('HabitSlice: Starting loadTodaysEntries');
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for entries');
      const entries = await OfflineStorageService.getTodaysEntriesOffline();
      console.log('HabitSlice: Loaded offline entries:', entries.length);
      set({ todaysEntries: entries });
    } catch (error) {
      console.error('HabitSlice: Error loading offline entries:', error);
      set({ error: 'Unable to load today\'s entries', todaysEntries: [] });
    }
  },

  // Create new habit
  createHabit: async (habitData) => {
    console.log('HabitSlice: Starting createHabit with data:', habitData);
    set({ isLoading: true, error: null });
    
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for create habit');
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
    } catch (error) {
      console.error('HabitSlice: Error creating offline habit:', error);
      set({ error: 'Unable to create habit', isLoading: false });
      throw error;
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

  // Toggle habit completion for a specific date
  toggleHabitCompletion: async (habitId, date) => {
    console.log('HabitSlice: Toggling habit completion for', habitId, 'on', date);
    try {
      // Force offline mode for now to test
      console.log('HabitSlice: Using offline mode for toggle completion');
      await OfflineStorageService.toggleHabitCompletionOffline(habitId, date);
      
      // Reload today's entries to reflect the change
      const entries = await OfflineStorageService.getTodaysEntriesOffline();
      set({ todaysEntries: entries });
      
      // Recalculate stats for this habit to update progress
      await get().loadHabitStats(habitId);
      await get().loadHabitStreaks(habitId);
      
      console.log('HabitSlice: Habit completion toggled and stats updated');
    } catch (error) {
      console.error('HabitSlice: Error toggling habit completion:', error);
      set({ error: 'Unable to toggle habit completion' });
    }
  },

  // Load habit statistics
  loadHabitStats: async (habitId: string) => {
    try {
      console.log('HabitSlice: Calculating real stats for habit', habitId);
      
      // Get ALL entries for this habit (not just today's)
      const offlineData = await OfflineStorageService.loadOfflineData();
      const habitEntries = offlineData.habitEntries.filter(entry => entry.habit_id === habitId);
      
      // Calculate this month's progress
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysSoFarInMonth = now.getDate();
      
      const thisMonthEntries = habitEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= startOfMonth && entryDate <= now;
      });
      
      const completedThisMonth = thisMonthEntries.filter(entry => entry.is_completed).length;
      
      // Calculate monthly progress as: completed days / total days in month (not just elapsed days)
      // This makes more sense for monthly progress tracking
      const monthlyProgress = daysInMonth > 0 ? (completedThisMonth / daysInMonth) : 0;
      
      console.log('HabitSlice: Monthly progress calculation for habit', habitId);
      console.log('- Days in month:', daysInMonth);
      console.log('- Days so far in month:', daysSoFarInMonth);
      console.log('- Completed this month:', completedThisMonth);
      console.log('- This month entries:', thisMonthEntries.length);
      console.log('- Monthly progress:', Math.round(monthlyProgress * 100) + '% (out of full month)');
      
      // Calculate total completions
      const totalCompletions = habitEntries.filter(entry => entry.is_completed).length;
      const completionRate = habitEntries.length > 0 ? (totalCompletions / habitEntries.length) : 0;
      
      const stats = {
        totalCompletions,
        completionRate,
        currentStreak: 0, // Will be calculated by loadHabitStreaks
        longestStreak: 0,
        averageCompletionsPerWeek: 0,
        lastSevenDays: [false, false, false, false, false, false, false],
        monthlyProgress
      };
      
      console.log('HabitSlice: Calculated stats for habit', habitId, '- monthlyProgress:', Math.round(monthlyProgress * 100) + '%');
      
      const currentStats = get().habitStats;
      const newStats = new Map(currentStats);
      newStats.set(habitId, stats);
      
      set({ habitStats: newStats });
    } catch (error) {
      console.error('Error loading habit stats:', error);
    }
  },

  // Load habit streaks
  loadHabitStreaks: async (habitId: string) => {
    try {
      console.log('HabitSlice: Calculating real streaks for habit', habitId);
      
      // Get ALL entries for this habit
      const offlineData = await OfflineStorageService.loadOfflineData();
      const habitEntries = offlineData.habitEntries
        .filter(entry => entry.habit_id === habitId && entry.is_completed)
        .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastCompletedDate: string | undefined = undefined;
      
      if (habitEntries.length > 0) {
        // Sort entries by date
        const sortedEntries = habitEntries.sort((a, b) => 
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
        );
        
        lastCompletedDate = sortedEntries[0]?.entry_date;
        
        // Calculate current streak (working backwards from today)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Check if completed today
        const completedToday = habitEntries.some(entry => entry.entry_date === todayStr);
        
        // Calculate streak starting from yesterday (or today if completed today)
        let streakStartDate = completedToday ? 0 : 1; // Start from today if completed, otherwise yesterday
        
        // Count consecutive days backward
        for (let i = streakStartDate; i < 30; i++) { // Check up to 30 days back
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          const completedOnDate = habitEntries.some(entry => entry.entry_date === checkDateStr);
          if (completedOnDate) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // Calculate longest streak
        const allDates = habitEntries.map(entry => entry.entry_date).sort();
        for (let i = 0; i < allDates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const prevDate = new Date(allDates[i - 1]);
            const currDate = new Date(allDates[i]);
            const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
      
      const streaks = {
        current: currentStreak,
        longest: longestStreak,
        lastCompletedDate: lastCompletedDate ? new Date(lastCompletedDate) : undefined
      };
      
      console.log('HabitSlice: Calculated streaks for habit', habitId, '- current:', currentStreak, 'longest:', longestStreak);
      
      const currentStreaks = get().habitStreaks;
      const newStreaks = new Map(currentStreaks);
      newStreaks.set(habitId, streaks);
      
      set({ habitStreaks: newStreaks });
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

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const currentCategories = get().categories;
      set({ categories: [...currentCategories, data] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset app completely (for error recovery)
  resetApp: async () => {
    console.log('HabitSlice: Resetting app completely');
    try {
      // Clear all storage
      await ResetStorageService.resetAllData();
      
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
});