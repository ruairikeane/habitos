import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit, HabitEntry, Category, HabitWithCategory } from '@/types';
import { HabitFrequency } from '@/types';
import { FileBackupService } from './fileBackupService';
import { getTodayLocalDate } from '@/utils/dateHelpers';

interface OfflineData {
  habits: HabitWithCategory[];
  categories: Category[];
  habitEntries: HabitEntry[];
  pendingSync: PendingOperation[];
}

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'habits' | 'categories' | 'habit_entries';
  data: any;
  timestamp: string;
}

export class OfflineStorageService {
  private static readonly OFFLINE_DATA_KEY = 'habitos_offline_data';
  private static readonly SYNC_QUEUE_KEY = 'habitos_sync_queue';

  // Load offline data from AsyncStorage
  static async loadOfflineData(): Promise<OfflineData> {
    console.log('OfflineStorageService: Starting loadOfflineData');
    try {
      const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      console.log('OfflineStorageService: Retrieved data string:', dataString ? 'exists' : 'null');
      
      if (!dataString) {
        // Initialize with sample data for first time users
        console.log('OfflineStorageService: Creating default data');
        const defaultData = await this.createDefaultOfflineData();
        console.log('OfflineStorageService: Created default data with', defaultData.habits.length, 'habits and', defaultData.categories.length, 'categories');
        await this.saveOfflineData(defaultData);
        console.log('OfflineStorageService: Saved default data');
        return defaultData;
      }
      
      const parsedData = JSON.parse(dataString);
      console.log('OfflineStorageService: Parsed existing data with', parsedData.habits?.length || 0, 'habits and', parsedData.categories?.length || 0, 'categories');
      
      // Migrate existing data to add new categories
      const migratedData = await this.migrateOfflineData(parsedData);
      if (migratedData !== parsedData) {
        console.log('OfflineStorageService: Data migrated, saving updated data');
        await this.saveOfflineData(migratedData);
      }
      
      return migratedData;
    } catch (error) {
      console.error('OfflineStorageService: Failed to load offline data:', error);
      return {
        habits: [],
        categories: [],
        habitEntries: [],
        pendingSync: []
      };
    }
  }

  // Migrate existing offline data to add any missing default categories
  private static async migrateOfflineData(data: OfflineData): Promise<OfflineData> {
    const defaultData = await this.createDefaultOfflineData();
    const existingCategoryIds = new Set(data.categories.map(cat => cat.id));
    let dataChanged = false;
    
    // Add any missing default categories
    for (const defaultCategory of defaultData.categories) {
      if (!existingCategoryIds.has(defaultCategory.id)) {
        console.log('OfflineStorageService: Adding missing category:', defaultCategory.name);
        data.categories.push(defaultCategory);
        dataChanged = true;
      }
    }
    
    return dataChanged ? { ...data } : data;
  }

  // Create default offline data for new users
  private static async createDefaultOfflineData(): Promise<OfflineData> {
    const defaultCategories: Category[] = [
      {
        id: 'offline_cat_health',
        user_id: 'offline_user',
        name: 'Health',
        color: '#9CAF88',
        icon: 'heart',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'offline_cat_productivity',
        user_id: 'offline_user',
        name: 'Productivity',
        color: '#A4956B',
        icon: 'briefcase',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'offline_cat_fitness',
        user_id: 'offline_user',
        name: 'Fitness',
        color: '#A67C7C',
        icon: 'barbell',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'offline_cat_learning',
        user_id: 'offline_user',
        name: 'Learning',
        color: '#8FA4B2',
        icon: 'book',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const defaultHabits: HabitWithCategory[] = [
      {
        id: 'offline_habit_water',
        user_id: 'offline_user',
        category_id: 'offline_cat_health',
        name: 'Drink 8 glasses of water',
        description: 'Stay hydrated throughout the day',
        frequency: HabitFrequency.DAILY,
        color: '#9CAF88',
        icon: 'water',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: defaultCategories[0]
      },
      {
        id: 'offline_habit_exercise',
        user_id: 'offline_user',
        category_id: 'offline_cat_fitness',
        name: '30 minutes of exercise',
        description: 'Daily physical activity for health',
        frequency: HabitFrequency.DAILY,
        color: '#A67C7C',
        icon: 'fitness',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: defaultCategories[2]
      },
      {
        id: 'offline_habit_reading',
        user_id: 'offline_user',
        category_id: 'offline_cat_productivity',
        name: 'Read for 20 minutes',
        description: 'Daily reading to expand knowledge',
        frequency: HabitFrequency.DAILY,
        color: '#A4956B',
        icon: 'book',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: defaultCategories[1]
      }
    ];

    return {
      habits: defaultHabits,
      categories: defaultCategories,
      habitEntries: [],
      pendingSync: []
    };
  }

  // Save offline data to AsyncStorage (no loading to avoid infinite loop)
  static async saveOfflineData(data: OfflineData): Promise<void> {
    try {
      console.log('OfflineStorageService: Saving data to AsyncStorage');
      await AsyncStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(data));
      console.log('OfflineStorageService: Data saved successfully');
      
      // Create automatic file backup after saving
      await FileBackupService.createAutoBackup();
    } catch (error) {
      console.error('OfflineStorageService: Failed to save offline data:', error);
    }
  }

  // Update specific parts of offline data
  static async updateOfflineData(updates: Partial<OfflineData>): Promise<void> {
    try {
      const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      let currentData: OfflineData;
      
      if (!dataString) {
        currentData = {
          habits: [],
          categories: [],
          habitEntries: [],
          pendingSync: []
        };
      } else {
        currentData = JSON.parse(dataString);
      }
      
      const updatedData = { ...currentData, ...updates };
      await this.saveOfflineData(updatedData); // This will trigger auto backup
    } catch (error) {
      console.error('OfflineStorageService: Failed to update offline data:', error);
    }
  }

  // Add operation to sync queue
  static async addToSyncQueue(operation: Omit<PendingOperation, 'id' | 'timestamp'>): Promise<void> {
    try {
      const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      let currentData: OfflineData;
      
      if (!dataString) {
        currentData = {
          habits: [],
          categories: [],
          habitEntries: [],
          pendingSync: []
        };
      } else {
        currentData = JSON.parse(dataString);
      }
      
      const newOperation: PendingOperation = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      currentData.pendingSync.push(newOperation);
      await this.saveOfflineData(currentData);
    } catch (error) {
      console.error('Failed to add operation to sync queue:', error);
    }
  }

  // Get pending sync operations
  static async getPendingSyncOperations(): Promise<PendingOperation[]> {
    try {
      const data = await this.loadOfflineData();
      return data.pendingSync;
    } catch (error) {
      console.error('Failed to get pending sync operations:', error);
      return [];
    }
  }

  // Clear sync queue after successful sync
  static async clearSyncQueue(): Promise<void> {
    try {
      await this.updateOfflineData({ pendingSync: [] });
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  // Remove specific operation from sync queue
  static async removeFromSyncQueue(operationId: string): Promise<void> {
    try {
      const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      if (!dataString) return;
      
      const currentData = JSON.parse(dataString);
      const filteredOperations = currentData.pendingSync.filter((op: PendingOperation) => op.id !== operationId);
      currentData.pendingSync = filteredOperations;
      await this.saveOfflineData(currentData);
    } catch (error) {
      console.error('Failed to remove operation from sync queue:', error);
    }
  }

  // Offline habit management
  static async createHabitOffline(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<HabitWithCategory> {
    const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
    let currentData: OfflineData;
    
    if (!dataString) {
      currentData = await this.createDefaultOfflineData();
    } else {
      currentData = JSON.parse(dataString);
    }
    
    const category = currentData.categories.find(c => c.id === habit.category_id);
    
    const offlineHabit: HabitWithCategory = {
      ...habit,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'offline_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: category || {
        id: habit.category_id,
        name: 'Default',
        color: '#8B7355',
        icon: 'star',
        user_id: 'offline_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    currentData.habits.push(offlineHabit);
    await this.saveOfflineData(currentData);

    // Add to sync queue
    await this.addToSyncQueue({
      type: 'create',
      table: 'habits',
      data: habit
    });

    return offlineHabit;
  }

  // Offline habit completion toggle
  static async toggleHabitCompletionOffline(habitId: string, date: string): Promise<void> {
    const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
    let currentData: OfflineData;
    
    if (!dataString) {
      currentData = await this.createDefaultOfflineData();
    } else {
      currentData = JSON.parse(dataString);
    }
    
    // Find existing entry
    const existingEntry = currentData.habitEntries.find(
      entry => entry.habit_id === habitId && entry.entry_date === date
    );

    if (existingEntry) {
      // Update existing entry
      existingEntry.is_completed = !existingEntry.is_completed;
      existingEntry.completed_at = existingEntry.is_completed ? new Date().toISOString() : undefined;
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        habit_id: habitId,
        user_id: 'offline_user',
        entry_date: date,
        is_completed: true,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      currentData.habitEntries.push(newEntry);
    }

    await this.saveOfflineData(currentData);

    // Add to sync queue
    await this.addToSyncQueue({
      type: existingEntry ? 'update' : 'create',
      table: 'habit_entries',
      data: existingEntry || {
        habit_id: habitId,
        entry_date: date,
        is_completed: true,
        completed_at: new Date().toISOString()
      }
    });
  }

  // Get today's habit entries for offline mode
  static async getTodaysEntriesOffline(): Promise<HabitEntry[]> {
    const dataString = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
    if (!dataString) {
      return [];
    }
    
    const currentData = JSON.parse(dataString);
    const today = getTodayLocalDate();
    
    return currentData.habitEntries.filter((entry: HabitEntry) => entry.entry_date === today);
  }

  // Clear all offline data (for testing or reset)
  static async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.OFFLINE_DATA_KEY, this.SYNC_QUEUE_KEY]);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  // Get sync status
  static async getSyncStatus(): Promise<{ 
    hasPendingOperations: boolean; 
    operationCount: number; 
    lastSync: Date | null 
  }> {
    try {
      const pendingOps = await this.getPendingSyncOperations();
      const lastSyncString = await AsyncStorage.getItem('last_sync_timestamp');
      
      return {
        hasPendingOperations: pendingOps.length > 0,
        operationCount: pendingOps.length,
        lastSync: lastSyncString ? new Date(lastSyncString) : null
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        hasPendingOperations: false,
        operationCount: 0,
        lastSync: null
      };
    }
  }

  // Update last sync timestamp
  static async updateLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem('last_sync_timestamp', new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  }
}