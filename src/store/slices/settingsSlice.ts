import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'earth-tones' | 'classic' | 'vibrant';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string | null;
  notificationsEnabled: boolean;
  firstTimeUser: boolean;
}

export interface SettingsSlice {
  // State
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<void>;
  clearError: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  fontSize: 'medium',
  colorScheme: 'earth-tones',
  autoBackup: false,
  backupFrequency: 'weekly',
  lastBackupDate: null,
  notificationsEnabled: true,
  firstTimeUser: true,
};

const SETTINGS_STORAGE_KEY = 'habitos_settings';

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  // Initial state
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  // Load settings from AsyncStorage
  loadSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (settingsJson) {
        const savedSettings = JSON.parse(settingsJson);
        // Merge with defaults to ensure all keys exist
        const mergedSettings: AppSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        set({ settings: mergedSettings, isLoading: false });
        console.log('Settings loaded:', mergedSettings);
      } else {
        // First time user, save defaults
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
        console.log('Default settings saved for first time user');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ error: 'Failed to load settings', isLoading: false });
    }
  },

  // Update a specific setting
  updateSetting: async (key, value) => {
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, [key]: value };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // Update state
      set({ settings: updatedSettings });
      
      console.log(`Setting ${key} updated to:`, value);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      set({ error: `Failed to update ${key}` });
    }
  },

  // Reset all settings to defaults
  resetSettings: async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      set({ settings: DEFAULT_SETTINGS });
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      set({ error: 'Failed to reset settings' });
    }
  },

  // Export settings as JSON string
  exportSettings: async () => {
    try {
      const settings = get().settings;
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      set({ error: 'Failed to export settings' });
      return '';
    }
  },

  // Import settings from JSON string
  importSettings: async (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const mergedSettings: AppSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));
      
      // Update state
      set({ settings: mergedSettings });
      
      console.log('Settings imported successfully');
    } catch (error) {
      console.error('Error importing settings:', error);
      set({ error: 'Failed to import settings. Please check the format.' });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
});