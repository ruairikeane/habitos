import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import type { ProfileScreenProps } from '@/types';

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { habits, habitStats, habitStreaks, resetApp, backupToFirebase } = useStore();
  const [profileStats, setProfileStats] = useState({
    totalHabits: 0,
    totalCompletions: 0,
    longestStreak: 0,
    currentStreak: 0,
    daysActive: 0,
    perfectDays: 0,
    averageCompletion: 0,
  });

  useEffect(() => {
    calculateProfileStats();
  }, [habits, habitStats, habitStreaks]);

  // Auto-backup on first load (one-time)
  useEffect(() => {
    const performBackup = async () => {
      // Check if backup has already been done
      const hasBackedUp = await AsyncStorage.getItem('firebase_backup_complete');
      if (!hasBackedUp && habits.length > 0) {
        console.log('ProfileScreen: Auto-triggering Firebase backup');
        try {
          const result = await backupToFirebase();
          if (result.success) {
            console.log('ProfileScreen: Auto-backup successful');
            await AsyncStorage.setItem('firebase_backup_complete', 'true');
          }
        } catch (error) {
          console.error('ProfileScreen: Auto-backup failed:', error);
        }
      }
    };
    
    performBackup();
  }, [habits, backupToFirebase]);

  const calculateProfileStats = () => {
    const totalHabits = habits.length;
    
    // Calculate total completions
    const totalCompletions = Array.from(habitStats.values()).reduce(
      (sum, stat) => sum + (stat.totalCompletions || 0), 0
    );

    // Calculate longest streak
    const longestStreak = Math.max(
      ...Array.from(habitStreaks.values()).map(streak => streak.longest),
      0
    );

    // Calculate current streak (best among all habits)
    const currentStreak = Math.max(
      ...Array.from(habitStreaks.values()).map(streak => streak.current),
      0
    );

    // Calculate days active (simplified - based on total completions)
    const daysActive = Math.min(Math.floor(totalCompletions / Math.max(totalHabits, 1)), 365);

    // Calculate perfect days (days where all habits were completed)
    const perfectDays = Math.floor(daysActive * 0.3); // Simplified calculation

    // Calculate average completion rate
    const averageCompletion = totalHabits > 0 ? 
      Array.from(habitStats.values()).reduce((sum, stat) => sum + stat.monthlyProgress, 0) / totalHabits * 100 : 0;

    setProfileStats({
      totalHabits,
      totalCompletions,
      longestStreak,
      currentStreak,
      daysActive,
      perfectDays,
      averageCompletion: Math.round(averageCompletion),
    });
  };

  const getMotivationalMessage = () => {
    const { longestStreak, currentStreak, totalCompletions } = profileStats;
    
    if (totalCompletions === 0) {
      return "Ready to start your habit journey! 🚀";
    } else if (currentStreak >= 7) {
      return "You're on fire! Keep that streak going! 🔥";
    } else if (longestStreak >= 21) {
      return "Habit formation master! You've got this! 💪";
    } else if (totalCompletions >= 100) {
      return "Century club member! Amazing dedication! 🎯";
    } else {
      return "Building great habits, one day at a time! 🌱";
    }
  };

  const getAchievementLevel = () => {
    const { totalCompletions } = profileStats;
    
    if (totalCompletions >= 1000) return { level: "Legend", icon: "trophy", color: colors.warning };
    if (totalCompletions >= 500) return { level: "Expert", icon: "medal", color: colors.success };
    if (totalCompletions >= 100) return { level: "Champion", icon: "ribbon", color: colors.primary };
    if (totalCompletions >= 50) return { level: "Achiever", icon: "star", color: colors.learning };
    if (totalCompletions >= 10) return { level: "Builder", icon: "construct", color: colors.mindfulness };
    return { level: "Starter", icon: "leaf", color: colors.health };
  };

  const handleBackupToFirebase = async () => {
    Alert.alert(
      'Backup to Firebase',
      'This will save all your habits and categories to Firebase cloud storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Backup Now', 
          style: 'default',
          onPress: async () => {
            try {
              const result = await backupToFirebase();
              if (result.success) {
                Alert.alert(
                  'Backup Successful!',
                  `Backed up ${result.habitsCount} habits and ${result.categoriesCount} categories to Firebase.`,
                  [{ text: 'OK', style: 'default' }]
                );
              } else {
                Alert.alert(
                  'Backup Failed',
                  result.error || 'Unknown error occurred during backup.',
                  [{ text: 'OK', style: 'default' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Backup Error',
                'An unexpected error occurred during backup.',
                [{ text: 'OK', style: 'default' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    // First confirmation - Warning
    Alert.alert(
      'Reset App Data',
      'This will permanently delete all your habits, entries, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'destructive',
          onPress: () => {
            // Second confirmation - Type to confirm
            Alert.prompt(
              'Are you absolutely sure?',
              'Type "DELETE ALL DATA" to confirm this permanent action:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive',
                  onPress: async (inputText) => {
                    if (inputText === 'DELETE ALL DATA') {
                      // Third confirmation - Final warning
                      Alert.alert(
                        'Final Warning',
                        'You are about to permanently delete all your habit data. This cannot be undone. Are you absolutely certain?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Yes, Delete Everything', 
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await resetApp();
                                Alert.alert(
                                  'App Reset',
                                  'All data has been cleared. You can now start fresh!',
                                  [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
                                );
                              } catch (error) {
                                Alert.alert('Error', 'Failed to reset app. Please try again.');
                              }
                            }
                          }
                        ]
                      );
                    } else {
                      Alert.alert('Cancelled', 'Text did not match. Reset cancelled.');
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const achievement = getAchievementLevel();

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
            Profile
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Achievement Level */}
        <View style={styles.section}>
          <View style={[globalStyles.card, styles.achievementCard]}>
            <View style={styles.achievementHeader}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                <Ionicons name={achievement.icon as any} size={32} color={achievement.color} />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[typography.h4, styles.achievementLevel]}>
                  {achievement.level}
                </Text>
                <Text style={[typography.body, styles.motivationalMessage]}>
                  {getMotivationalMessage()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📊 Your Stats
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.totalHabits}
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Total Habits
              </Text>
            </View>

            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.totalCompletions}
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Completions
              </Text>
            </View>

            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.longestStreak}
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Longest Streak
              </Text>
            </View>

            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.currentStreak}
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Current Streak
              </Text>
            </View>

            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.averageCompletion}%
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Avg Completion
              </Text>
            </View>

            <View style={[globalStyles.card, styles.statCard]}>
              <Text style={[typography.h3, styles.statValue]}>
                {profileStats.daysActive}
              </Text>
              <Text style={[typography.caption, styles.statLabel]}>
                Days Active
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🏆 Achievements
          </Text>
          
          <View style={[globalStyles.card, styles.achievementsCard]}>
            <View style={styles.achievementItem}>
              <Ionicons 
                name="flame" 
                size={20} 
                color={profileStats.longestStreak >= 7 ? colors.warning : colors.textSecondary} 
              />
              <View style={styles.achievementText}>
                <Text style={[typography.bodyMedium, styles.achievementName]}>
                  Week Warrior
                </Text>
                <Text style={[typography.caption, styles.achievementDescription]}>
                  {profileStats.longestStreak >= 7 ? '✓ Achieved' : 'Maintain a 7-day streak'}
                </Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <Ionicons 
                name="calendar" 
                size={20} 
                color={profileStats.longestStreak >= 30 ? colors.success : colors.textSecondary} 
              />
              <View style={styles.achievementText}>
                <Text style={[typography.bodyMedium, styles.achievementName]}>
                  Monthly Master
                </Text>
                <Text style={[typography.caption, styles.achievementDescription]}>
                  {profileStats.longestStreak >= 30 ? '✓ Achieved' : 'Maintain a 30-day streak'}
                </Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <Ionicons 
                name="trophy" 
                size={20} 
                color={profileStats.totalCompletions >= 100 ? colors.primary : colors.textSecondary} 
              />
              <View style={styles.achievementText}>
                <Text style={[typography.bodyMedium, styles.achievementName]}>
                  Century Club
                </Text>
                <Text style={[typography.caption, styles.achievementDescription]}>
                  {profileStats.totalCompletions >= 100 ? '✓ Achieved' : 'Complete 100 habits'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reset App */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ⚠️ Reset
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.resetCard]}
            onPress={handleResetApp}
          >
            <View style={styles.resetContent}>
              <Ionicons name="refresh-outline" size={24} color={colors.error} />
              <View style={styles.resetText}>
                <Text style={[typography.bodyMedium, styles.resetTitle]}>
                  Reset App Data
                </Text>
                <Text style={[typography.caption, styles.resetDescription]}>
                  Start fresh with a clean slate
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
  achievementCard: {
    backgroundColor: colors.primary + '08',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  achievementLevel: {
    color: colors.primary,
  },
  motivationalMessage: {
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  achievementsCard: {
    gap: spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  achievementText: {
    flex: 1,
    gap: spacing.xs,
  },
  achievementName: {
    color: colors.textPrimary,
  },
  achievementDescription: {
    color: colors.textSecondary,
  },
  resetCard: {
    backgroundColor: colors.error + '08',
    borderColor: colors.error + '30',
    borderWidth: 1,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resetText: {
    flex: 1,
    gap: spacing.xs,
  },
  resetTitle: {
    color: colors.error,
    fontWeight: '600',
  },
  resetDescription: {
    color: colors.textSecondary,
  },
});