import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '../../styles';
import { useNotifications } from '../../hooks';
import type { NotificationSettingsScreenProps } from '../../types';

export function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const { 
    permissionGranted, 
    requestPermissions, 
    cancelAllNotifications,
    getScheduledNotifications 
  } = useNotifications();
  
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  };

  const handlePermissionRequest = async () => {
    try {
      const granted = await requestPermissions();
      
      if (granted) {
        Alert.alert(
          'Success', 
          'Notification permissions granted! You can now receive habit reminders.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Denied', 
          'To receive habit reminders, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // In a real app, you would open device settings
              Alert.alert('Open Settings', 'Please go to Settings > Apps > Habitos > Notifications to enable.');
            }}
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions.');
    }
  };

  const handleClearNotifications = async () => {
    Alert.alert(
      'Clear All Reminders',
      'This will cancel all scheduled habit reminders. You can re-enable them when creating or editing habits.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              setScheduledCount(0);
              Alert.alert('Success', 'All habit reminders have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications.');
            }
          }
        }
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
            Notification Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Permission Status */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📱 Permission Status
          </Text>
          
          <View style={[globalStyles.card, styles.statusCard]}>
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: permissionGranted ? colors.success : colors.error }
                ]} />
                <View style={styles.statusText}>
                  <Text style={[typography.bodyMedium, styles.statusTitle]}>
                    Push Notifications
                  </Text>
                  <Text style={[typography.caption, styles.statusDescription]}>
                    {permissionGranted 
                      ? 'Enabled - You can receive habit reminders' 
                      : 'Disabled - Enable to receive habit reminders'
                    }
                  </Text>
                </View>
              </View>
              
              {!permissionGranted && (
                <TouchableOpacity 
                  style={styles.enableButton}
                  onPress={handlePermissionRequest}
                >
                  <Text style={[typography.caption, styles.enableButtonText]}>
                    Enable
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Current Reminders */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ⏰ Active Reminders
          </Text>
          
          <View style={[globalStyles.card, styles.reminderCard]}>
            <View style={styles.reminderRow}>
              <View style={styles.reminderLeft}>
                <Ionicons 
                  name="notifications-outline" 
                  size={24} 
                  color={scheduledCount > 0 ? colors.primary : colors.textSecondary} 
                />
                <View style={styles.reminderText}>
                  <Text style={[typography.bodyMedium, styles.reminderTitle]}>
                    Scheduled Reminders
                  </Text>
                  <Text style={[typography.caption, styles.reminderDescription]}>
                    {scheduledCount === 0 
                      ? 'No active reminders'
                      : `${scheduledCount} habit reminder${scheduledCount === 1 ? '' : 's'} scheduled`
                    }
                  </Text>
                </View>
              </View>
              
              {scheduledCount > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={handleClearNotifications}
                >
                  <Text style={[typography.caption, styles.clearButtonText]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            💡 About Habit Reminders
          </Text>
          
          <View style={[globalStyles.card, styles.helpCard]}>
            <View style={styles.helpItem}>
              <Text style={[typography.bodyMedium, styles.helpTitle]}>
                🔔 How it works
              </Text>
              <Text style={[typography.bodySmall, styles.helpDescription]}>
                Set reminder times when creating or editing habits. You'll get gentle notifications to help you stay consistent.
              </Text>
            </View>
            
            <View style={styles.helpItem}>
              <Text style={[typography.bodyMedium, styles.helpTitle]}>
                ⚙️ Managing reminders
              </Text>
              <Text style={[typography.bodySmall, styles.helpDescription]}>
                You can enable or disable reminders for individual habits in the Add/Edit Habit screen, or clear all reminders here.
              </Text>
            </View>
            
            <View style={styles.helpItem}>
              <Text style={[typography.bodyMedium, styles.helpTitle]}>
                🔋 Battery optimization
              </Text>
              <Text style={[typography.bodySmall, styles.helpDescription]}>
                If reminders stop working, check your device's battery optimization settings and ensure Habitos is allowed to run in the background.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🚀 Quick Actions
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Create Habit with Reminder
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Add a new habit and set up daily reminders
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate('Main')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <Ionicons name="list-outline" size={24} color={colors.secondary} />
                <View style={styles.actionText}>
                  <Text style={[typography.bodyMedium, styles.actionTitle]}>
                    Manage Existing Habits
                  </Text>
                  <Text style={[typography.caption, styles.actionDescription]}>
                    Edit reminders for your current habits
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  statusCard: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    flex: 1,
    gap: spacing.xs,
  },
  statusTitle: {
    color: colors.textPrimary,
  },
  statusDescription: {
    color: colors.textSecondary,
  },
  enableButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  enableButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  reminderCard: {
    gap: spacing.md,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  reminderText: {
    flex: 1,
    gap: spacing.xs,
  },
  reminderTitle: {
    color: colors.textPrimary,
  },
  reminderDescription: {
    color: colors.textSecondary,
  },
  clearButton: {
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.error,
    fontWeight: '600',
  },
  helpCard: {
    gap: spacing.md,
  },
  helpItem: {
    gap: spacing.xs,
  },
  helpTitle: {
    color: colors.textPrimary,
  },
  helpDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
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
});