import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { useScrollToTop } from '@/navigation/TabNavigator';
import type { SettingsScreenProps } from '@/types';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  // Scroll to top ref
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get store functions for debugging
  const { completeDataMigration, debugState, resetApp, forceRefreshStreaks, categories, loadCategories, cleanupDuplicateCategories, fixHabitColors } = useStore();
  
  const handleCleanupCategories = async () => {
    try {
      console.log('🧹 Starting category cleanup from Settings...');
      const result = await cleanupDuplicateCategories();
      
      if (result.success) {
        Alert.alert(
          'Cleanup Complete!', 
          `Successfully removed ${result.removedCount} duplicate categories. The app should now show each category only once.`
        );
        // Reload categories to reflect changes
        await loadCategories();
      } else {
        Alert.alert('Cleanup Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error in handleCleanupCategories:', error);
      Alert.alert('Error', 'Failed to cleanup categories');
    }
  };

  // Register scroll function for tab navigation
  useScrollToTop('Settings', () => {
    console.log('🔝 SettingsScreen: Scrolling to top');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  });

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ScrollView ref={scrollViewRef} style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
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
            onPress={() => navigation.navigate('BiometricSettings')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="finger-print" size={24} color={colors.success} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Biometric Authentication
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Face ID, Touch ID, and fingerprint settings
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

        {/* Advanced Tools Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔧 Advanced Tools
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={async () => {
              Alert.alert(
                'Complete Data Migration',
                'This will:\n• Extract ALL offline completion data\n• Clear Firebase completely\n• Migrate everything cleanly\n• Stop duplicate loading\n\nThis ensures data consistency and performance.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Migrate Data', 
                    onPress: async () => {
                      const result = await completeDataMigration();
                      if (result.success) {
                        Alert.alert(
                          'Migration Complete!',
                          `Successfully migrated:\n• ${result.habitsMigrated} habits\n• ${result.entriesMigrated} completion entries\n\nApp is now optimized for best performance.`
                        );
                      } else {
                        Alert.alert('Migration Failed', result.error || 'Unknown error');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="sync-outline" size={24} color={colors.primary} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Data Migration
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Optimize data storage and fix any sync issues
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={async () => {
              Alert.alert(
                'Force Refresh Streaks',
                'This will clear analytics cache and recalculate all habit streaks. This may fix incorrect streak calculations.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Refresh Streaks', 
                    onPress: async () => {
                      console.log('🔄 Force refreshing all streaks...');
                      await forceRefreshStreaks();
                      Alert.alert('Success', 'All habit streaks have been refreshed!');
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="refresh-outline" size={24} color={colors.warning} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Fix Streak Calculations
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Force refresh all habit streaks
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => {
              console.log('\n🔍 === CATEGORY DEBUG INFO ===');
              console.log('📊 Total categories in store:', categories.length);
              console.log('📋 Category details:');
              categories.forEach((cat, index) => {
                console.log(`  ${index + 1}. ID: ${cat.id} | Name: ${cat.name} | Color: ${cat.color}`);
              });
              
              // Check for ID duplicates
              const idDuplicates = categories.filter((cat, index) => 
                categories.findIndex(c => c.id === cat.id) !== index
              );
              console.log('🔄 ID duplicate categories found:', idDuplicates.length);
              
              // Check for name duplicates
              const nameGroups = new Map();
              categories.forEach(cat => {
                if (!nameGroups.has(cat.name)) {
                  nameGroups.set(cat.name, []);
                }
                nameGroups.get(cat.name).push(cat);
              });
              
              let nameDuplicatesCount = 0;
              for (const [name, cats] of nameGroups.entries()) {
                if (cats.length > 1) {
                  nameDuplicatesCount += (cats.length - 1); // Count extras
                  console.log(`  ❌ Name "${name}" has ${cats.length} entries (${cats.length - 1} duplicates)`);
                }
              }
              console.log('🔄 Total name-based duplicates found:', nameDuplicatesCount);
              
              // Check for duplicate names
              const nameMap = new Map();
              categories.forEach(cat => {
                if (nameMap.has(cat.name)) {
                  nameMap.set(cat.name, nameMap.get(cat.name) + 1);
                } else {
                  nameMap.set(cat.name, 1);
                }
              });
              
              console.log('📝 Name frequency:');
              for (const [name, count] of nameMap.entries()) {
                console.log(`  ${name}: ${count} times`);
              }
              console.log('🔍 === CATEGORY DEBUG END ===\n');
              
              Alert.alert('Category Debug', `Found ${categories.length} categories. Check console for detailed info.`);
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="bug-outline" size={24} color={colors.error} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Debug Categories
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Check for duplicate categories
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => {
              Alert.alert(
                'Clean Duplicate Categories',
                'This will permanently delete duplicate categories from Firebase, keeping only one of each category name. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clean Up', style: 'destructive', onPress: handleCleanupCategories }
                ]
              );
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="trash-outline" size={24} color={colors.warning} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Clean Duplicate Categories
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Remove duplicate categories from view
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.card, styles.menuItem]}
            onPress={async () => {
              Alert.alert(
                'Fix Habit Colors',
                'This will ensure all habits use their category colors correctly and remove any legacy color properties that might cause mismatches.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Fix Colors', 
                    onPress: async () => {
                      console.log('🎨 Starting habit color fix from Settings...');
                      const result = await fixHabitColors();
                      
                      if (result.success) {
                        Alert.alert(
                          'Colors Fixed!', 
                          `Successfully updated ${result.updatedCount} habits. All habits now use their correct category colors.`
                        );
                      } else {
                        Alert.alert('Fix Failed', result.error || 'Unknown error occurred');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="color-palette-outline" size={24} color={colors.creative} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    Fix Habit Colors
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    Ensure all habits use correct category colors
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.menuItem]}
            onPress={() => {
              debugState();
              Alert.alert('Debug Info', 'Check console logs for current app state details');
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="analytics-outline" size={24} color={colors.secondary} />
                <View style={styles.menuItemText}>
                  <Text style={[typography.bodyMedium, styles.menuItemTitle]}>
                    System Diagnostics
                  </Text>
                  <Text style={[typography.caption, styles.menuItemDescription]}>
                    View technical information in console
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