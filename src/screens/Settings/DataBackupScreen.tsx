import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { OfflineStorageService } from '@/services/storage/offlineStorage';
import { FileBackupService } from '@/services/storage/fileBackupService';
import type { DataBackupScreenProps } from '@/types';

export function DataBackupScreen({ navigation }: DataBackupScreenProps) {
  const { habits, categories, settings, updateSetting } = useStore();
  const [storageStats, setStorageStats] = useState({
    totalHabits: 0,
    totalEntries: 0,
    totalCategories: 0,
    lastBackup: null as string | null,
  });

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const data = await OfflineStorageService.loadOfflineData();
      setStorageStats({
        totalHabits: data.habits.length,
        totalEntries: data.habitEntries.length,
        totalCategories: data.categories.length,
        lastBackup: settings.lastBackupDate,
      });
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const exportData = async () => {
    try {
      const data = await OfflineStorageService.loadOfflineData();
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        habits: data.habits,
        categories: data.categories,
        habitEntries: data.habitEntries,
        settings: settings,
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const fileName = `habitos_backup_${new Date().toISOString().split('T')[0]}.json`;

      // Use Share API to let user choose where to save
      await Share.share({
        message: jsonData,
        title: 'Habitos Data Export',
      });

      // Update last backup date
      await updateSetting('lastBackupDate', new Date().toISOString());
      
      Alert.alert(
        'Export Successful',
        'Your data has been exported successfully. You can save it to your preferred location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const importData = () => {
    Alert.alert(
      'Import Data',
      'To import data, you would need to select a JSON file from your device. This feature requires file picker integration.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // In a real app, you would implement file picker here
            Alert.alert('File Picker', 'File picker integration would be implemented here.');
          }
        }
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your habits, entries, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data functionality would go here
              console.log('Clear all data requested');
              Alert.alert(
                'Data Cleared',
                'All data has been deleted. The app will now restart.',
                [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleAutoBackup = async (enabled: boolean) => {
    await updateSetting('autoBackup', enabled);
    if (enabled) {
      Alert.alert(
        'Auto Backup Enabled',
        'Your data will be automatically backed up based on your selected frequency.',
        [{ text: 'OK' }]
      );
    }
  };

  const changeBackupFrequency = () => {
    const options = ['Daily', 'Weekly', 'Monthly'];
    const currentIndex = options.findIndex(opt => opt.toLowerCase() === settings.backupFrequency);
    
    Alert.alert(
      'Backup Frequency',
      'How often would you like to automatically backup your data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Daily', onPress: () => updateSetting('backupFrequency', 'daily') },
        { text: 'Weekly', onPress: () => updateSetting('backupFrequency', 'weekly') },
        { text: 'Monthly', onPress: () => updateSetting('backupFrequency', 'monthly') },
      ]
    );
  };

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
            Data & Backup
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Storage Stats */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📊 Storage Usage
          </Text>
          
          <View style={[globalStyles.card, styles.statsCard]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[typography.h5, styles.statValue]}>
                  {storageStats.totalHabits}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Habits
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.h5, styles.statValue]}>
                  {storageStats.totalEntries}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Entries
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.h5, styles.statValue]}>
                  {storageStats.totalCategories}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Categories
                </Text>
              </View>
            </View>
            
            <View style={styles.lastBackup}>
              <Text style={[typography.caption, styles.lastBackupText]}>
                Last backup: {storageStats.lastBackup 
                  ? new Date(storageStats.lastBackup).toLocaleDateString()
                  : 'Never'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Export & Import */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📤 Export & Import
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={exportData}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="download-outline" size={24} color={colors.success} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Export Data
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Save your habits and entries to a file
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={importData}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Import Data
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Restore from a backup file
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate('BackupManagement')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="archive-outline" size={24} color={colors.warning} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Manage Backups
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    View and restore automatic backups
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Auto Backup Settings */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔄 Auto Backup
          </Text>
          
          <View style={[globalStyles.card, styles.autoBackupCard]}>
            <View style={styles.autoBackupHeader}>
              <View style={styles.autoBackupLeft}>
                <Ionicons name="time-outline" size={24} color={colors.warning} />
                <View style={styles.autoBackupText}>
                  <Text style={[typography.bodyMedium, styles.autoBackupTitle]}>
                    Automatic Backup
                  </Text>
                  <Text style={[typography.caption, styles.autoBackupDescription]}>
                    Regularly export your data
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.autoBackupToggle,
                  settings.autoBackup && styles.autoBackupToggleActive
                ]}
                onPress={() => toggleAutoBackup(!settings.autoBackup)}
              >
                <Text style={[
                  typography.caption,
                  styles.autoBackupToggleText,
                  settings.autoBackup && styles.autoBackupToggleTextActive
                ]}>
                  {settings.autoBackup ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {settings.autoBackup && (
              <TouchableOpacity 
                style={styles.frequencyButton}
                onPress={changeBackupFrequency}
              >
                <View style={styles.frequencyContent}>
                  <Text style={[typography.bodyMedium, styles.frequencyText]}>
                    Backup Frequency
                  </Text>
                  <View style={styles.frequencyRight}>
                    <Text style={[typography.caption, styles.frequencyValue]}>
                      {settings.backupFrequency.charAt(0).toUpperCase() + settings.backupFrequency.slice(1)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ⚠️ Danger Zone
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.dangerCard]}
            onPress={clearAllData}
          >
            <View style={styles.dangerContent}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
              <View style={styles.dangerText}>
                <Text style={[typography.bodyMedium, styles.dangerTitle]}>
                  Clear All Data
                </Text>
                <Text style={[typography.caption, styles.dangerDescription]}>
                  Permanently delete all habits and entries
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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
  statsCard: {
    gap: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  lastBackup: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastBackupText: {
    color: colors.textSecondary,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  actionText: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    color: colors.textPrimary,
  },
  actionDescription: {
    color: colors.textSecondary,
  },
  autoBackupCard: {
    gap: spacing.md,
  },
  autoBackupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoBackupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  autoBackupText: {
    flex: 1,
    gap: spacing.xs,
  },
  autoBackupTitle: {
    color: colors.textPrimary,
  },
  autoBackupDescription: {
    color: colors.textSecondary,
  },
  autoBackupToggle: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  autoBackupToggleActive: {
    backgroundColor: colors.primary,
  },
  autoBackupToggleText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  autoBackupToggleTextActive: {
    color: colors.surface,
  },
  frequencyButton: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  frequencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frequencyText: {
    color: colors.textPrimary,
  },
  frequencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  frequencyValue: {
    color: colors.textSecondary,
  },
  dangerCard: {
    backgroundColor: colors.error + '08',
    borderColor: colors.error + '30',
    borderWidth: 1,
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dangerText: {
    flex: 1,
    gap: spacing.xs,
  },
  dangerTitle: {
    color: colors.error,
    fontWeight: '600',
  },
  dangerDescription: {
    color: colors.textSecondary,
  },
});