// Core habit-related type definitions

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  reminder_time?: string;
  frequency: HabitFrequency;
  color: string;
  icon: string;
  habit_stacking?: string | null;
  implementation_intention?: string | null;
}

export interface HabitWithCategory extends Habit {
  category: Category;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  is_completed: boolean;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export interface CustomFrequency {
  type: HabitFrequency.CUSTOM;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  timesPerWeek?: number;
  timesPerMonth?: number;
}

export type HabitFrequencyConfig = HabitFrequency | CustomFrequency;

export interface HabitStreak {
  current: number;
  longest: number;
  lastCompletedDate?: Date;
}

export interface HabitStats {
  totalCompletions: number;
  completionRate: number; // 0-1
  currentStreak: number;
  longestStreak: number;
  averageCompletionsPerWeek: number;
  lastSevenDays: boolean[];
  monthlyProgress: number; // 0-1 for current month
}