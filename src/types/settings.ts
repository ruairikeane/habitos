// App settings and configuration type definitions

export interface AppSettings {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  data: DataSettings;
  tips: TipsSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  defaultReminderTime: Date;
  quietHours: {
    enabled: boolean;
    startTime: Date;
    endTime: Date;
  };
  weekendNotifications: boolean;
  motivationalMessages: boolean;
  streakReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationStyle: 'minimal' | 'detailed' | 'motivational';
}

export interface AppearanceSettings {
  theme: AppTheme;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  reduceMotion: boolean;
  highContrast: boolean;
  showProgressPercentages: boolean;
  compactView: boolean;
}

export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto' // Follow system
}

export enum ColorScheme {
  EARTH_TONES = 'earth_tones', // Default
  MONOCHROME = 'monochrome',
  HIGH_CONTRAST = 'high_contrast'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export interface DataSettings {
  backupEnabled: boolean;
  lastBackupDate?: Date;
  autoExportEnabled: boolean;
  exportFrequency: 'weekly' | 'monthly' | 'quarterly';
  dataRetentionPeriod: number; // months
  analyticsEnabled: boolean;
}

export interface TipsSettings {
  dailyTipsEnabled: boolean;
  tipsFrequency: 'daily' | 'weekly' | 'as_needed';
  preferredCategories: string[];
  completedChallenges: string[];
  bookmarkedTips: string[];
  tipsDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  contextualSuggestions: boolean;
}