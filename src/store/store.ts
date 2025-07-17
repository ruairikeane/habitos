// Main Zustand store configuration
import { create } from 'zustand';
import { createHabitSlice, type HabitSlice } from './slices/habitSlice';
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';

// Combined store type
export type AppStore = HabitSlice & SettingsSlice;

// Create the main store
export const useStore = create<AppStore>()((...args) => ({
  ...createHabitSlice(...args),
  ...createSettingsSlice(...args),
}));