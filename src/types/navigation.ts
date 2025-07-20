// Navigation type definitions for React Navigation

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack Navigator Types
export type RootStackParamList = {
  Main: undefined;
  HabitDetail: { habitId: string };
  AddHabit: undefined;
  EditHabit: { habitId: string };
  TipsLibrary: undefined;
  HabitStats: { habitId: string };
  NotificationSettings: undefined;
  BiometricSettings: undefined;
  Profile: undefined;
  DataSync: undefined;
  Appearance: undefined;
  DataBackup: undefined;
  BackupManagement: undefined;
  HelpSupport: undefined;
  About: undefined;
};

// Bottom Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Statistics: undefined;
  Tips: undefined;
  Settings: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Combined Navigation Props
export type HomeScreenProps = TabScreenProps<'Home'>;
export type HabitsScreenProps = TabScreenProps<'Habits'>;
export type StatisticsScreenProps = TabScreenProps<'Statistics'>;
export type TipsScreenProps = TabScreenProps<'Tips'>;
export type SettingsScreenProps = TabScreenProps<'Settings'>;

export type HabitDetailScreenProps = RootStackScreenProps<'HabitDetail'>;
export type AddHabitScreenProps = RootStackScreenProps<'AddHabit'>;
export type EditHabitScreenProps = RootStackScreenProps<'EditHabit'>;
export type TipsLibraryScreenProps = RootStackScreenProps<'TipsLibrary'>;
export type HabitStatsScreenProps = RootStackScreenProps<'HabitStats'>;
export type NotificationSettingsScreenProps = RootStackScreenProps<'NotificationSettings'>;
export type BiometricSettingsScreenProps = RootStackScreenProps<'BiometricSettings'>;
export type ProfileScreenProps = RootStackScreenProps<'Profile'>;
export type DataSyncScreenProps = RootStackScreenProps<'DataSync'>;
export type AppearanceScreenProps = RootStackScreenProps<'Appearance'>;
export type DataBackupScreenProps = RootStackScreenProps<'DataBackup'>;
export type BackupManagementScreenProps = RootStackScreenProps<'BackupManagement'>;
export type HelpSupportScreenProps = RootStackScreenProps<'HelpSupport'>;
export type AboutScreenProps = RootStackScreenProps<'About'>;