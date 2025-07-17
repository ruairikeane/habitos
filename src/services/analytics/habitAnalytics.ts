import { supabase } from '@/services/supabase';
import { memoizeAsync, analyticsCache } from '@/utils/memoization';
import type { HabitEntry, HabitStats, HabitStreak } from '@/types';

export class HabitAnalyticsService {
  // Memoized version of calculateStreaks
  static calculateStreaks = memoizeAsync(
    async (habitId: string, userId: string): Promise<HabitStreak> => {
      return HabitAnalyticsService._calculateStreaks(habitId, userId);
    },
    (habitId: string, userId: string) => `streaks_${habitId}_${userId}`,
    2 * 60 * 1000 // 2 minutes cache
  );

  /**
   * Calculate current and longest streak for a habit (internal implementation)
   */
  private static async _calculateStreaks(habitId: string, userId: string): Promise<HabitStreak> {
    try {
      const { data: entries, error } = await supabase
        .from('habit_entries')
        .select('entry_date, is_completed')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        return { current: 0, longest: 0 };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if completed today or yesterday (allows for today not being completed yet)
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const completedToday = entries.some(entry => entry.entry_date === todayStr);
      const completedYesterday = entries.some(entry => entry.entry_date === yesterdayStr);

      if (!completedToday && !completedYesterday) {
        // No recent completion, streak is broken
        currentStreak = 0;
      } else {
        // Count consecutive days backward from today/yesterday
        const completedDates = new Set(entries.map(e => e.entry_date));
        let checkDate = new Date(completedToday ? today : yesterday);
        
        // Count consecutive days going backward
        while (true) {
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          if (completedDates.has(checkDateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      
      // Convert dates to a set for O(1) lookup
      const completedDates = new Set(entries.map(e => e.entry_date));
      
      // Get date range from first entry to today
      if (entries.length > 0) {
        const firstDate = new Date(Math.min(...entries.map(e => new Date(e.entry_date).getTime())));
        const lastDate = new Date();
        
        // Process dates in chronological order to find longest streak
        for (let date = new Date(firstDate); date <= lastDate; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];
          
          if (completedDates.has(dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
      }
      
      console.log(`Streak calculation for habit ${habitId}: current=${currentStreak}, longest=${longestStreak}, entries=${entries.length}`);

      const lastCompletedDate = entries.length > 0 ? new Date(entries[0].entry_date) : undefined;

      return {
        current: currentStreak,
        longest: longestStreak,
        lastCompletedDate: lastCompletedDate
      } as HabitStreak;
    } catch (error) {
      console.error('Error calculating streaks:', error);
      // Clear any corrupted cache entries
      analyticsCache.delete(`streaks_${habitId}_${userId}`);
      return { current: 0, longest: 0 };
    }
  }

  // Memoized version of calculateHabitStats
  static calculateHabitStats = memoizeAsync(
    async (habitId: string, userId: string): Promise<HabitStats> => {
      return HabitAnalyticsService._calculateHabitStats(habitId, userId);
    },
    (habitId: string, userId: string) => `stats_${habitId}_${userId}`,
    3 * 60 * 1000 // 3 minutes cache
  );

  /**
   * Calculate comprehensive habit statistics (internal implementation)
   */
  private static async _calculateHabitStats(habitId: string, userId: string): Promise<HabitStats> {
    try {
      const { data: entries, error } = await supabase
        .from('habit_entries')
        .select('entry_date, is_completed')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      const completedEntries = entries?.filter(e => e.is_completed) || [];
      const totalCompletions = completedEntries.length;

      // Calculate streaks
      const streaks = await this.calculateStreaks(habitId, userId);

      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const recentEntries = entries?.filter(e => e.entry_date >= thirtyDaysAgoStr) || [];
      const recentCompletions = recentEntries.filter(e => e.is_completed).length;
      const completionRate = recentEntries.length > 0 ? recentCompletions / 30 : 0;

      // Last seven days completion
      const lastSevenDays: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const completed = completedEntries.some(e => e.entry_date === checkDateStr);
        lastSevenDays.push(completed);
      }
      
      console.log(`Last 7 days for habit ${habitId}:`, lastSevenDays, 'Completed entries:', completedEntries.length);

      // Average completions per week
      const weeksOfData = entries && entries.length > 0 ? 
        Math.max(1, Math.ceil((Date.now() - new Date(entries[entries.length - 1].entry_date).getTime()) / (7 * 24 * 60 * 60 * 1000))) : 1;
      const averageCompletionsPerWeek = totalCompletions / weeksOfData;

      // Monthly progress (current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      const monthlyCompletions = completedEntries.filter(e => {
        const entryDate = new Date(e.entry_date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      }).length;
      
      const monthlyProgress = monthlyCompletions / daysInMonth;

      return {
        totalCompletions,
        completionRate,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        averageCompletionsPerWeek,
        lastSevenDays,
        monthlyProgress
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      return {
        totalCompletions: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCompletionsPerWeek: 0,
        lastSevenDays: [false, false, false, false, false, false, false],
        monthlyProgress: 0
      };
    }
  }

  /**
   * Get habit entries for a specific date range
   */
  static async getHabitEntriesInRange(
    habitId: string, 
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<HabitEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      return entries || [];
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      return [];
    }
  }

  /**
   * Calculate overall user progress for a time period
   */
  static async calculateOverallProgress(userId: string, startDate: string, endDate: string) {
    try {
      // Get all habits for user
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (habitsError) throw habitsError;

      if (!habits || habits.length === 0) {
        return {
          totalHabits: 0,
          totalCompletions: 0,
          overallCompletionRate: 0,
          bestPerformingHabit: null,
          worstPerformingHabit: null
        };
      }

      // Get all entries in date range
      const { data: entries, error: entriesError } = await supabase
        .from('habit_entries')
        .select('habit_id, is_completed')
        .eq('user_id', userId)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate);

      if (entriesError) throw entriesError;

      const completedEntries = entries?.filter(e => e.is_completed) || [];
      const totalCompletions = completedEntries.length;

      // Calculate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const possibleCompletions = habits.length * daysDiff;
      
      const overallCompletionRate = possibleCompletions > 0 ? totalCompletions / possibleCompletions : 0;

      // Find best and worst performing habits
      const habitStats = new Map<string, { completed: number; total: number }>();
      
      habits.forEach(habit => {
        habitStats.set(habit.id, { completed: 0, total: daysDiff });
      });

      completedEntries.forEach(entry => {
        const stat = habitStats.get(entry.habit_id);
        if (stat) {
          stat.completed++;
        }
      });

      let bestHabit = null;
      let worstHabit = null;
      let bestRate = -1;
      let worstRate = 2; // Higher than possible rate

      for (const [habitId, stats] of habitStats.entries()) {
        const rate = stats.completed / stats.total;
        
        if (rate > bestRate) {
          bestRate = rate;
          bestHabit = habitId;
        }
        
        if (rate < worstRate) {
          worstRate = rate;
          worstHabit = habitId;
        }
      }

      return {
        totalHabits: habits.length,
        totalCompletions,
        overallCompletionRate,
        bestPerformingHabit: bestHabit,
        worstPerformingHabit: worstHabit
      };
    } catch (error) {
      console.error('Error calculating overall progress:', error);
      return {
        totalHabits: 0,
        totalCompletions: 0,
        overallCompletionRate: 0,
        bestPerformingHabit: null,
        worstPerformingHabit: null
      };
    }
  }

  /**
   * Get monthly completion data for charts
   */
  static async getMonthlyCompletionData(userId: string, year: number) {
    try {
      const { data: entries, error } = await supabase
        .from('habit_entries')
        .select('entry_date, is_completed')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .gte('entry_date', `${year}-01-01`)
        .lte('entry_date', `${year}-12-31`);

      if (error) throw error;

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        completions: 0,
        monthName: new Date(year, i).toLocaleString('default', { month: 'short' })
      }));

      entries?.forEach(entry => {
        const entryDate = new Date(entry.entry_date);
        const month = entryDate.getMonth();
        monthlyData[month].completions++;
      });

      return monthlyData;
    } catch (error) {
      console.error('Error getting monthly completion data:', error);
      return [];
    }
  }
}