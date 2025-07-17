// TypeScript type definitions exports

// Habit-related types
export type {
  Habit,
  HabitWithCategory,
  HabitEntry,
  Category,
  CustomFrequency,
  HabitFrequencyConfig,
  HabitStreak,
  HabitStats
} from './habit';

// Habit-related enums
export { HabitFrequency } from './habit';

// Analytics and progress types
export type {
  MonthlyProgress,
  HabitMonthlyProgress,
  StreakData,
  ProgressChartData,
  CategoryProgress,
  PersonalRecord,
  WeeklyPattern,
  HeatmapData,
  TrendAnalysis
} from './analytics';

// Navigation types
export type {
  RootStackParamList,
  TabParamList,
  RootStackScreenProps,
  TabScreenProps,
  HomeScreenProps,
  HabitsScreenProps,
  StatisticsScreenProps,
  TipsScreenProps,
  SettingsScreenProps,
  HabitDetailScreenProps,
  AddHabitScreenProps,
  EditHabitScreenProps,
  TipsLibraryScreenProps,
  HabitStatsScreenProps,
  NotificationSettingsScreenProps,
  ProfileScreenProps,
  DataSyncScreenProps,
  AppearanceScreenProps,
  DataBackupScreenProps,
  HelpSupportScreenProps,
  AboutScreenProps
} from './navigation';

// Tips and educational content types
export type {
  Tip,
  TipCategory,
  TipType,
  TipDifficulty,
  HabitStackTemplate,
  ImplementationIntention,
  WeeklyChallenge
} from './tips';

// Settings and configuration types
export type {
  AppSettings,
  NotificationSettings,
  AppearanceSettings,
  AppTheme,
  ColorScheme,
  FontSize,
  DataSettings,
  TipsSettings
} from './settings';