import * as FileSystem from 'expo-file-system';
import { OfflineStorageService } from './offlineStorage';

export class FileBackupService {
  private static readonly BACKUP_FOLDER = `${FileSystem.documentDirectory}habitos_backups/`;
  private static readonly MAX_BACKUPS = 5; // Keep last 5 backups
  private static readonly BACKUP_FILE_PREFIX = 'habitos_backup_';

  // Ensure backup directory exists
  private static async ensureBackupDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_FOLDER);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.BACKUP_FOLDER, { intermediates: true });
        console.log('FileBackupService: Created backup directory');
      }
    } catch (error) {
      console.error('FileBackupService: Error creating backup directory:', error);
    }
  }

  // Create automatic backup
  static async createAutoBackup(): Promise<void> {
    try {
      await this.ensureBackupDirectory();
      
      // Get current data
      const offlineData = await OfflineStorageService.loadOfflineData();
      
      // Create backup file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${this.BACKUP_FILE_PREFIX}${timestamp}.json`;
      const backupPath = `${this.BACKUP_FOLDER}${backupFileName}`;
      
      // Create backup data with metadata
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: offlineData,
        stats: {
          totalHabits: offlineData.habits.length,
          totalEntries: offlineData.habitEntries.length,
          totalCategories: offlineData.categories.length
        }
      };
      
      // Write backup file
      await FileSystem.writeAsStringAsync(backupPath, JSON.stringify(backupData, null, 2));
      
      console.log('FileBackupService: Auto backup created:', backupFileName);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
    } catch (error) {
      console.error('FileBackupService: Error creating auto backup:', error);
    }
  }

  // Clean up old backups (keep only MAX_BACKUPS)
  private static async cleanupOldBackups(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_FOLDER);
      if (!dirInfo.exists) return;
      
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_FOLDER);
      const backupFiles = files
        .filter(file => file.startsWith(this.BACKUP_FILE_PREFIX))
        .sort()
        .reverse(); // Newest first
      
      // Delete old backups if we have more than MAX_BACKUPS
      if (backupFiles.length > this.MAX_BACKUPS) {
        const filesToDelete = backupFiles.slice(this.MAX_BACKUPS);
        
        for (const file of filesToDelete) {
          await FileSystem.deleteAsync(`${this.BACKUP_FOLDER}${file}`);
          console.log('FileBackupService: Deleted old backup:', file);
        }
      }
      
    } catch (error) {
      console.error('FileBackupService: Error cleaning up old backups:', error);
    }
  }

  // List all available backups
  static async listBackups(): Promise<Array<{
    filename: string;
    path: string;
    timestamp: string;
    size: number;
  }>> {
    try {
      await this.ensureBackupDirectory();
      
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_FOLDER);
      const backupFiles = files.filter(file => file.startsWith(this.BACKUP_FILE_PREFIX));
      
      const backups = [];
      for (const file of backupFiles) {
        const filePath = `${this.BACKUP_FOLDER}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/habitos_backup_(.+)\.json/);
        const timestamp = timestampMatch ? timestampMatch[1].replace(/-/g, ':') : 'Unknown';
        
        backups.push({
          filename: file,
          path: filePath,
          timestamp: timestamp,
          size: fileInfo.size || 0
        });
      }
      
      return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      
    } catch (error) {
      console.error('FileBackupService: Error listing backups:', error);
      return [];
    }
  }

  // Restore from backup file
  static async restoreFromBackup(backupPath: string): Promise<boolean> {
    try {
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(backupContent);
      
      // Validate backup data structure
      if (!backupData.data || !backupData.data.habits || !backupData.data.categories) {
        console.error('FileBackupService: Invalid backup data structure');
        return false;
      }
      
      // Restore data to AsyncStorage
      await OfflineStorageService.saveOfflineData(backupData.data);
      
      console.log('FileBackupService: Data restored from backup');
      return true;
      
    } catch (error) {
      console.error('FileBackupService: Error restoring from backup:', error);
      return false;
    }
  }

  // Get backup info without loading full data
  static async getBackupInfo(backupPath: string): Promise<{
    timestamp: string;
    totalHabits: number;
    totalEntries: number;
    totalCategories: number;
  } | null> {
    try {
      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(backupContent);
      
      return {
        timestamp: backupData.timestamp,
        totalHabits: backupData.stats?.totalHabits || 0,
        totalEntries: backupData.stats?.totalEntries || 0,
        totalCategories: backupData.stats?.totalCategories || 0
      };
      
    } catch (error) {
      console.error('FileBackupService: Error getting backup info:', error);
      return null;
    }
  }

  // Export backup to sharing location
  static async exportBackup(backupPath: string): Promise<string | null> {
    try {
      const fileName = backupPath.split('/').pop() || 'habitos_backup.json';
      const exportPath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Copy backup to cache directory for sharing
      await FileSystem.copyAsync({
        from: backupPath,
        to: exportPath
      });
      
      return exportPath;
      
    } catch (error) {
      console.error('FileBackupService: Error exporting backup:', error);
      return null;
    }
  }

  // Check if backups are available
  static async hasBackups(): Promise<boolean> {
    try {
      const backups = await this.listBackups();
      return backups.length > 0;
    } catch (error) {
      console.error('FileBackupService: Error checking for backups:', error);
      return false;
    }
  }

  // Get backup folder path for user reference
  static getBackupFolderPath(): string {
    return this.BACKUP_FOLDER;
  }
}