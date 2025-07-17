import { supabase } from '@/services/supabase';
import { OfflineStorageService, type PendingOperation } from '@/services/storage/offlineStorage';
import { SupabaseConnectionTester, RetryHelper } from '@/services/supabase/connectionTest';

export class SyncService {
  private static issyncing = false;
  private static readonly SYNC_INTERVAL = 30000; // 30 seconds
  private static syncTimer: NodeJS.Timeout | null = null;

  // Start automatic sync process
  static startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      await this.attemptSync();
    }, this.SYNC_INTERVAL);

    // Initial sync attempt
    this.attemptSync();
  }

  // Stop automatic sync
  static stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Attempt to sync with server
  static async attemptSync(): Promise<boolean> {
    if (this.issyncing) {
      return false;
    }

    this.issyncing = true;
    
    try {
      // Check if we have connectivity
      const diagnostics = await SupabaseConnectionTester.runDiagnostics();
      if (!diagnostics.overall) {
        console.log('No connectivity, skipping sync');
        return false;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping sync');
        return false;
      }

      // Get pending operations
      const pendingOperations = await OfflineStorageService.getPendingSyncOperations();
      if (pendingOperations.length === 0) {
        await OfflineStorageService.updateLastSyncTimestamp();
        return true;
      }

      console.log(`Syncing ${pendingOperations.length} pending operations`);

      // Process operations in order
      for (const operation of pendingOperations) {
        try {
          await this.processOperation(operation, user.id);
          await OfflineStorageService.removeFromSyncQueue(operation.id);
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          // Continue with other operations
        }
      }

      // Update last sync timestamp
      await OfflineStorageService.updateLastSyncTimestamp();
      
      // Download latest data from server
      await this.downloadLatestData(user.id);

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.issyncing = false;
    }
  }

  // Process individual sync operation
  private static async processOperation(operation: PendingOperation, userId: string): Promise<void> {
    const { type, table, data } = operation;

    switch (table) {
      case 'habits':
        await this.syncHabitOperation(type, data, userId);
        break;
      case 'categories':
        await this.syncCategoryOperation(type, data, userId);
        break;
      case 'habit_entries':
        await this.syncHabitEntryOperation(type, data, userId);
        break;
      default:
        console.warn(`Unknown table for sync: ${table}`);
    }
  }

  // Sync habit operations
  private static async syncHabitOperation(
    type: 'create' | 'update' | 'delete',
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('habits')
            .insert({
              ...data,
              user_id: userId
            });
          if (error) throw error;
        });
        break;
      
      case 'update':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('habits')
            .update({
              ...data,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .eq('user_id', userId);
          if (error) throw error;
        });
        break;
      
      case 'delete':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('habits')
            .update({ 
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .eq('user_id', userId);
          if (error) throw error;
        });
        break;
    }
  }

  // Sync category operations
  private static async syncCategoryOperation(
    type: 'create' | 'update' | 'delete',
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('categories')
            .insert({
              ...data,
              user_id: userId
            });
          if (error) throw error;
        });
        break;
      
      case 'update':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('categories')
            .update({
              ...data,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .eq('user_id', userId);
          if (error) throw error;
        });
        break;
    }
  }

  // Sync habit entry operations
  private static async syncHabitEntryOperation(
    type: 'create' | 'update' | 'delete',
    data: any,
    userId: string
  ): Promise<void> {
    switch (type) {
      case 'create':
        await RetryHelper.withRetry(async () => {
          // Check if entry already exists
          const { data: existingEntry } = await supabase
            .from('habit_entries')
            .select('id')
            .eq('habit_id', data.habit_id)
            .eq('user_id', userId)
            .eq('entry_date', data.entry_date)
            .single();

          if (existingEntry) {
            // Update existing entry instead
            const { error } = await supabase
              .from('habit_entries')
              .update({
                is_completed: data.is_completed,
                completed_at: data.completed_at,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingEntry.id);
            if (error) throw error;
          } else {
            // Create new entry
            const { error } = await supabase
              .from('habit_entries')
              .insert({
                ...data,
                user_id: userId
              });
            if (error) throw error;
          }
        });
        break;
      
      case 'update':
        await RetryHelper.withRetry(async () => {
          const { error } = await supabase
            .from('habit_entries')
            .update({
              ...data,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .eq('user_id', userId);
          if (error) throw error;
        });
        break;
    }
  }

  // Download latest data from server
  private static async downloadLatestData(userId: string): Promise<void> {
    try {
      // Get latest habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (habitsError) throw habitsError;

      // Get latest categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) throw categoriesError;

      // Get recent habit entries (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: habitEntries, error: entriesError } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0]);

      if (entriesError) throw entriesError;

      // Save to offline storage
      await OfflineStorageService.saveOfflineData({
        habits: habits || [],
        categories: categories || [],
        habitEntries: habitEntries || [],
        pendingSync: []
      });

    } catch (error) {
      console.error('Failed to download latest data:', error);
    }
  }

  // Force sync now
  static async forcSync(): Promise<boolean> {
    return await this.attemptSync();
  }

  // Get sync status
  static async getSyncStatus(): Promise<{
    isOnline: boolean;
    hasPendingOperations: boolean;
    operationCount: number;
    lastSync: Date | null;
  }> {
    const connectionState = SupabaseConnectionTester.getConnectionState();
    const syncStatus = await OfflineStorageService.getSyncStatus();
    
    return {
      isOnline: connectionState.isOnline,
      hasPendingOperations: syncStatus.hasPendingOperations,
      operationCount: syncStatus.operationCount,
      lastSync: syncStatus.lastSync
    };
  }
}