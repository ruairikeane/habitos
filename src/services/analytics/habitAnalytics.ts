import { FirebaseDatabaseService } from '../../services/firebase/databaseService';
import { memoizeAsync, analyticsCache } from '../../utils/memoization';
import { getTodayLocalDate, getLocalDateString } from '../../utils/dateHelpers';
import type { HabitEntry, HabitStats, HabitStreak } from '../../types';

export class HabitAnalyticsService {
  /**
   * Clear all analytics cache to force recalculation
   */
  static clearAllCache() {
    console.log('🧹 Clearing all analytics cache...');
    analyticsCache.clear();
  }

  // Memoized version of calculateStreaks
  static calculateStreaks = memoizeAsync(
    async (habitId: string, userId: string): Promise<HabitStreak> => {
      return HabitAnalyticsService._calculateStreaks(habitId, userId);
    },
    (habitId: string, userId: string) => `streaks_${habitId}_${userId}`,
    1000 // 1 second cache to ensure fresh data
  );

  /**
   * Calculate current and longest streak for a habit (internal implementation)
   */
  private static async _calculateStreaks(habitId: string, userId: string): Promise<HabitStreak> {
    try {
      console.log('Analytics: _calculateStreaks called with habitId:', habitId, 'userId:', userId);
      
      if (!userId || userId === 'undefined') {
        console.error('Analytics: Invalid userId for _calculateStreaks:', userId);
        return { current: 0, longest: 0 };
      }
      
      // Use Firebase to get habit entries
      const entries = await FirebaseDatabaseService.getHabitEntries(userId, habitId);
      const completedEntries = entries
        .filter(entry => entry.is_completed)
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

      if (!completedEntries || completedEntries.length === 0) {
        return { current: 0, longest: 0 };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if completed today or yesterday (allows for today not being completed yet)
      const todayStr = getTodayLocalDate();
      const yesterdayStr = getLocalDateString(yesterday);
      
      const completedToday = completedEntries.some(entry => entry.entry_date === todayStr);
      const completedYesterday = completedEntries.some(entry => entry.entry_date === yesterdayStr);

      if (!completedToday && !completedYesterday) {
        // No recent completion, streak is broken
        currentStreak = 0;
      } else {
        // Count consecutive days backward from today/yesterday
        const completedDates = new Set(completedEntries.map(e => e.entry_date));
        let checkDate = new Date(completedToday ? today : yesterday);
        
        // Count consecutive days going backward
        while (true) {
          const checkDateStr = getLocalDateString(checkDate);
          
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
      const completedDates = new Set(completedEntries.map(e => e.entry_date));
      
      // Get date range from first entry to today
      if (completedEntries.length > 0) {
        const firstDate = new Date(Math.min(...completedEntries.map(e => new Date(e.entry_date).getTime())));
        const lastDate = new Date();
        
        // Process dates in chronological order to find longest streak
        for (let date = new Date(firstDate); date <= lastDate; date.setDate(date.getDate() + 1)) {
          const dateStr = getLocalDateString(date);
          
          if (completedDates.has(dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
      }
      
      console.log(`Streak calculation for habit ${habitId}: current=${currentStreak}, longest=${longestStreak}, entries=${completedEntries.length}`);

      const lastCompletedDate = completedEntries.length > 0 ? new Date(completedEntries[0].entry_date) : undefined;

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
    async (habitId: string, userId: string, month?: number, year?: number): Promise<HabitStats> => {
      return HabitAnalyticsService._calculateHabitStats(habitId, userId, month, year);
    },
    (habitId: string, userId: string, month?: number, year?: number) => 
      `stats_${habitId}_${userId}_${month ?? 'current'}_${year ?? 'current'}`,
    1000 // 1 second cache to ensure fresh data
  );

  /**
   * Calculate comprehensive habit statistics (internal implementation)
   */
  private static async _calculateHabitStats(habitId: string, userId: string, month?: number, year?: number): Promise<HabitStats> {
    try {
      console.log('Analytics: _calculateHabitStats called with habitId:', habitId, 'userId:', userId);
      
      if (!userId || userId === 'undefined') {
        console.error('Analytics: Invalid userId for _calculateHabitStats:', userId);
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
      
      // Use Firebase to get habit entries
      const entries = await FirebaseDatabaseService.getHabitEntries(userId, habitId);
      const sortedEntries = entries.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

      const completedEntries = sortedEntries?.filter(e => e.is_completed) || [];
      const totalCompletions = completedEntries.length;

      // Calculate streaks
      const streaks = await this.calculateStreaks(habitId, userId);

      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo);

      const recentEntries = sortedEntries?.filter(e => e.entry_date >= thirtyDaysAgoStr) || [];
      const recentCompletions = recentEntries.filter(e => e.is_completed).length;
      const completionRate = recentEntries.length > 0 ? recentCompletions / 30 : 0;

      // Last seven days completion
      const lastSevenDays: boolean[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = getLocalDateString(checkDate);
        
        const completed = completedEntries.some(e => e.entry_date === checkDateStr);
        lastSevenDays.push(completed);
      }

      // Average completions per week
      const weeksOfData = sortedEntries && sortedEntries.length > 0 ? 
        Math.max(1, Math.ceil((Date.now() - new Date(sortedEntries[sortedEntries.length - 1].entry_date).getTime()) / (7 * 24 * 60 * 60 * 1000))) : 1;
      const averageCompletionsPerWeek = totalCompletions / weeksOfData;

      // Monthly progress (selected month or current month)
      const now = new Date();
      const targetMonth = month ?? now.getMonth();
      const targetYear = year ?? now.getFullYear();
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const currentDay = now.getDate();
      
      const monthlyCompletions = completedEntries.filter(e => {
        const entryDate = new Date(e.entry_date);
        return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
      }).length;
      
      // Calculate progress based on days passed in month (more intuitive)
      const daysPassedInMonth = Math.min(currentDay, daysInMonth);
      const monthlyProgress = daysPassedInMonth > 0 ? monthlyCompletions / daysPassedInMonth : 0;

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
      // Use Firebase to get habit entries
      const entries = await FirebaseDatabaseService.getHabitEntries(userId, habitId);
      const filteredEntries = entries
        .filter(entry => 
          entry.entry_date >= startDate &&
          entry.entry_date <= endDate
        )
        .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

      return filteredEntries || [];
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
      // Use Firebase to get habits and entries
      const habits = await FirebaseDatabaseService.getHabits(userId);
      const activeHabits = habits.filter(habit => habit.is_active);

      if (!activeHabits || activeHabits.length === 0) {
        return {
          totalHabits: 0,
          totalCompletions: 0,
          overallCompletionRate: 0,
          bestPerformingHabit: null,
          worstPerformingHabit: null
        };
      }

      // Get all entries in date range
      const allEntries = await FirebaseDatabaseService.getHabitEntries(userId);
      const entries = allEntries.filter(entry =>
        entry.entry_date >= startDate && entry.entry_date <= endDate
      );

      const completedEntries = entries?.filter(e => e.is_completed) || [];
      const totalCompletions = completedEntries.length;

      // Calculate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const possibleCompletions = activeHabits.length * daysDiff;
      
      const overallCompletionRate = possibleCompletions > 0 ? totalCompletions / possibleCompletions : 0;

      // Find best and worst performing habits
      const habitStats = new Map<string, { completed: number; total: number }>();
      
      activeHabits.forEach(habit => {
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
        totalHabits: activeHabits.length,
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
      // Use Firebase to get habit entries
      const allEntries = await FirebaseDatabaseService.getHabitEntries(userId);
      const entries = allEntries.filter(entry =>
        entry.is_completed &&
        entry.entry_date >= `${year}-01-01` &&
        entry.entry_date <= `${year}-12-31`
      );

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