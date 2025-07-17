// Analytics and progress tracking type definitions

export interface MonthlyProgress {
  month: number; // 1-12
  year: number;
  completionRate: number; // 0-1
  totalDays: number;
  completedDays: number;
  habits: HabitMonthlyProgress[];
}

export interface HabitMonthlyProgress {
  habitId: string;
  habitName: string;
  completionRate: number; // 0-1
  targetDays: number; // Based on frequency
  completedDays: number;
  streakData: StreakData;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  lastCompletedDate?: Date;
}

export interface ProgressChartData {
  date: Date;
  value: number;
  label?: string;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  color: string;
  completionRate: number; // 0-1
  habitsCount: number;
  activeHabitsCount: number;
}

export interface PersonalRecord {
  type: 'longest_streak' | 'perfect_month' | 'most_habits_day' | 'consistency';
  value: number;
  date: Date;
  habitId?: string;
  description: string;
}

export interface WeeklyPattern {
  dayOfWeek: number; // 0-6, Sunday = 0
  dayName: string;
  completionRate: number; // 0-1
  averageCompletions: number;
}

export interface HeatmapData {
  date: Date;
  value: number; // 0-1, completion rate for that day
  level: 0 | 1 | 2 | 3 | 4; // Intensity level for color coding
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  percentage: number; // Change percentage
  period: 'week' | 'month' | 'quarter';
  confidence: 'high' | 'medium' | 'low';
}