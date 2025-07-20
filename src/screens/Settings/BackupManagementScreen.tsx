import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { FileBackupService } from '@/services/storage';
import { useStore } from '@/store';
import type { BackupManagementScreenProps } from '@/types';

interface BackupItem {
  filename: string;
  path: string;
  timestamp: string;
  size: number;
  info?: {
    timestamp: string;
    totalHabits: number;
    totalEntries: number;
    totalCategories: number;
  };
}

export function BackupManagementScreen({ navigation }: BackupManagementScreenProps) {
  const { loadHabits, loadCategories, loadTodaysEntries, loadAllHabitsStats } = useStore();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupList = await FileBackupService.listBackups();
      
      // Get detailed info for each backup
      const backupsWithInfo = await Promise.all(
        backupList.map(async (backup) => {
          const info = await FileBackupService.getBackupInfo(backup.path);
          return { ...backup, info };
        })
      );
      
      setBackups(backupsWithInfo);
    } catch (error) {
      console.error('Error loading backups:', error);
      Alert.alert('Error', 'Failed to load backups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = (backup: BackupItem) => {
    const formatDate = (timestamp: string) => {
      try {
        const date = new Date(timestamp.replace(/-/g, ':'));
        return date.toLocaleString();
      } catch {
        return timestamp;
      }
    };

    Alert.alert(
      'Restore Backup',
      `Are you sure you want to restore from backup created on ${formatDate(backup.timestamp)}?\n\nThis backup contains:\n• ${backup.info?.totalHabits || 0} habits\n• ${backup.info?.totalEntries || 0} entries\n• ${backup.info?.totalCategories || 0} categories\n\nYour current data will be replaced.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => performRestore(backup)
        }
      ]
    );
  };

  const performRestore = async (backup: BackupItem) => {
    setIsRestoring(true);
    try {
      const success = await FileBackupService.restoreFromBackup(backup.path);
      
      if (success) {
        // Reload all data in the app
        await loadHabits();
        await loadCategories();
        await loadTodaysEntries();
        await loadAllHabitsStats();
        
        Alert.alert(
          'Restore Complete',
          'Your data has been successfully restored from the backup.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to restore backup. Please try again.');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      Alert.alert('Error', 'Failed to restore backup. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCreateManualBackup = async () => {
    try {
      await FileBackupService.createAutoBackup();
      Alert.alert('Success', 'Manual backup created successfully!');
      await loadBackups(); // Reload the backup list
    } catch (error) {
      console.error('Error creating manual backup:', error);
      Alert.alert('Error', 'Failed to create backup. Please try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp.replace(/-/g, ':'));
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Backup Management
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading backups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Backup Management
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[globalStyles.card, styles.infoCard]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={[typography.h4, styles.infoTitle]}>
                Automatic Backups
              </Text>
            </View>
            <Text style={[typography.body, styles.infoText]}>
              Your habit data is automatically backed up to secure files every time you make changes. 
              Up to 5 backups are kept, and old ones are automatically removed.
            </Text>
            <Text style={[typography.bodySmall, styles.infoPath]}>
              Backup location: {FileBackupService.getBackupFolderPath()}
            </Text>
          </View>
        </View>

        {/* Create Manual Backup */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[globalStyles.buttonPrimary, styles.createBackupButton]}
            onPress={handleCreateManualBackup}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
            <Text style={[globalStyles.buttonText, styles.createBackupText]}>
              Create Manual Backup
            </Text>
          </TouchableOpacity>
        </View>

        {/* Backup List */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Available Backups ({backups.length})
          </Text>
          
          {backups.length === 0 ? (
            <View style={[globalStyles.card, styles.emptyCard]}>
              <Ionicons name="archive-outline" size={48} color={colors.textSecondary} />
              <Text style={[typography.body, styles.emptyText]}>
                No backups found. Create your first backup above.
              </Text>
            </View>
          ) : (
            backups.map((backup, index) => (
              <View key={backup.filename} style={[globalStyles.card, styles.backupCard]}>
                <View style={styles.backupHeader}>
                  <View style={styles.backupInfo}>
                    <Text style={[typography.bodyMedium, styles.backupDate]}>
                      {formatDate(backup.timestamp)}
                    </Text>
                    <Text style={[typography.caption, styles.backupSize]}>
                      {formatFileSize(backup.size)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[globalStyles.buttonSecondary, styles.restoreButton]}
                    onPress={() => handleRestoreBackup(backup)}
                    disabled={isRestoring}
                  >
                    <Ionicons name="refresh-outline" size={16} color={colors.surface} />
                    <Text style={[globalStyles.buttonText, styles.restoreButtonText]}>
                      {isRestoring ? 'Restoring...' : 'Restore'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {backup.info && (
                  <View style={styles.backupStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="list" size={16} color={colors.textSecondary} />
                      <Text style={[typography.caption, styles.statText]}>
                        {backup.info.totalHabits} habits
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.textSecondary} />
                      <Text style={[typography.caption, styles.statText]}>
                        {backup.info.totalEntries} entries
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="folder" size={16} color={colors.textSecondary} />
                      <Text style={[typography.caption, styles.statText]}>
                        {backup.info.totalCategories} categories
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.primary + '08',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    color: colors.primary,
  },
  infoText: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoPath: {
    color: colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  createBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  createBackupText: {
    marginLeft: -spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backupCard: {
    marginBottom: spacing.md,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    color: colors.textPrimary,
  },
  backupSize: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  restoreButtonText: {
    fontSize: 14,
  },
  backupStats: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});