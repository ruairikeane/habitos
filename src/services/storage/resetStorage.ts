import AsyncStorage from '@react-native-async-storage/async-storage';

export class ResetStorageService {
  // Clear all app data and start fresh
  static async resetAllData(): Promise<void> {
    try {
      console.log('ResetStorageService: Clearing all app data');
      
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      
      console.log('ResetStorageService: All data cleared successfully');
    } catch (error) {
      console.error('ResetStorageService: Failed to clear data:', error);
    }
  }

  // Clear just offline data
  static async resetOfflineData(): Promise<void> {
    try {
      console.log('ResetStorageService: Clearing offline data only');
      
      const keys = [
        'habitos_offline_data',
        'supabase_connectivity_state',
        'last_sync_timestamp'
      ];
      
      await AsyncStorage.multiRemove(keys);
      
      console.log('ResetStorageService: Offline data cleared successfully');
    } catch (error) {
      console.error('ResetStorageService: Failed to clear offline data:', error);
    }
  }
}