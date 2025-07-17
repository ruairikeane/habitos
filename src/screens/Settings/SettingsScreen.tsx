import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import type { SettingsScreenProps } from '@/types';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            👤 Account
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Profile
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Manage your account settings
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('DataSync')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="cloud-outline" size={24} color={colors.secondary} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Data & Sync
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Backup and sync your habits
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('TipsLibrary')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="library-outline" size={24} color={colors.info} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Complete Tips Library
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Browse all tips and strategies
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ⚙️ App Settings
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={24} color={colors.warning} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Notifications
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Manage reminders and alerts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('Appearance')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="color-palette-outline" size={24} color={colors.creative} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Appearance
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Theme, colors, and display options
                  </Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[typography.caption, styles.currentSetting]}>
                  Earth Tones
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('DataBackup')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="download-outline" size={24} color={colors.success} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Data & Backup
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Export data and manage storage
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>


        {/* App Information Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ℹ️ About
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={24} color={colors.info} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Help & Support
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Get help and contact support
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    About Habitos
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Version 1.0.0 • Built with ❤️
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  menuItem: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuItemText: {
    flex: 1,
    gap: spacing.xs,
  },
  menuItemTitle: {
    color: colors.textPrimary,
  },
  menuItemDescription: {
    color: colors.textSecondary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentSetting: {
    color: colors.textSecondary,
  },
});