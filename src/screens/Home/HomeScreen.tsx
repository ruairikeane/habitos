import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { EXTENDED_HABIT_TIPS } from '@/services/defaultData';
import { AnimatedCheckbox, StreakCelebration } from '@/components/common';
import { useDateTracker } from '@/hooks';
import type { HomeScreenProps } from '@/types';

export const HomeScreen = React.memo(function HomeScreen({ navigation }: HomeScreenProps) {
  const { 
    habits, 
    todaysEntries, 
    habitStreaks,
    habitStats,
    isLoading, 
    error,
    loadHabits, 
    loadTodaysEntries, 
    toggleHabitCompletion,
    clearError
  } = useStore();

  const [currentTip, setCurrentTip] = useState(0);
  const [celebrationStreak, setCelebrationStreak] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Track date changes for midnight reset
  const { currentDate, hasDateChanged, resetDateChange } = useDateTracker();

  useEffect(() => {
    console.log('HomeScreen: Loading habits and today\'s entries...');
    const loadData = async () => {
      await loadHabits();
      await loadTodaysEntries();
      console.log('HomeScreen: Loaded', habits.length, 'habits and', todaysEntries.length, 'entries');
    };
    loadData();
  }, []);

  useEffect(() => {
    // Rotate tips daily
    const tipIndex = new Date().getDate() % EXTENDED_HABIT_TIPS.length;
    setCurrentTip(tipIndex);
  }, []);

  // Handle midnight reset - reload data when date changes
  useEffect(() => {
    if (hasDateChanged) {
      console.log('HomeScreen: Date changed detected, refreshing data for new day:', currentDate);
      
      const refreshDataForNewDay = async () => {
        try {
          // Reload today's entries for the new date
          await loadTodaysEntries();
          
          // Update tip for new day
          const tipIndex = new Date().getDate() % EXTENDED_HABIT_TIPS.length;
          setCurrentTip(tipIndex);
          
          console.log('HomeScreen: Data refreshed for new day');
        } catch (error) {
          console.error('HomeScreen: Error refreshing data for new day:', error);
        }
      };
      
      refreshDataForNewDay();
      resetDateChange();
    }
  }, [hasDateChanged, currentDate, loadTodaysEntries, resetDateChange]);

  const today = currentDate;

  const getHabitCompletion = (habitId: string) => {
    return todaysEntries.find(entry => 
      entry.habit_id === habitId && entry.entry_date === today
    )?.is_completed || false;
  };

  const handleToggleHabit = useCallback(async (habitId: string) => {
    const wasCompleted = getHabitCompletion(habitId);
    await toggleHabitCompletion(habitId, today);
    
    // Show celebration if habit was just completed and has a streak
    if (!wasCompleted) {
      setTimeout(() => {
        const streak = habitStreaks.get(habitId);
        if (streak && streak.current > 0) {
          setCelebrationStreak(streak.current);
          setShowCelebration(true);
        }
      }, 300); // Small delay to let the streak update
    }
  }, [getHabitCompletion, toggleHabitCompletion, today, habitStreaks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 17) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  if (error) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={[typography.h4, styles.errorText]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            loadHabits();
            loadTodaysEntries();
          }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <StreakCelebration
        streak={celebrationStreak || 0}
        isVisible={showCelebration}
        onAnimationComplete={() => {
          setShowCelebration(false);
          setCelebrationStreak(null);
        }}
      />
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Daily Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[typography.h3, styles.greeting]}>
            {getGreeting()}
          </Text>
          <Text style={[typography.bodySmall, styles.subGreeting]}>
            Ready to build great habits today?
          </Text>
        </View>

        {/* Daily Tips Section */}
        <View style={[globalStyles.card, styles.tipCard]}>
          <Text style={[typography.h5, styles.tipTitle]}>
            💡 Daily Tip
          </Text>
          <Text style={[typography.body, styles.tipContent]}>
            {EXTENDED_HABIT_TIPS[currentTip]?.content ?? 'Build small habits that compound over time.'}
          </Text>
          <Text style={[typography.caption, styles.tipSource]}>
            {EXTENDED_HABIT_TIPS[currentTip]?.title ?? 'Daily Tip'} • Based on Atomic Habits principles
          </Text>
        </View>

        {/* Today's Habits Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Today's Habits
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.bodySmall, styles.loadingText]}>
                Loading your habits...
              </Text>
            </View>
          ) : habits.length === 0 ? (
            <View style={[globalStyles.card, styles.emptyCard]}>
              <Text style={[typography.body, styles.emptyText]}>
                No habits yet! Head to the Habits tab to create your first habit.
              </Text>
            </View>
          ) : (
            habits.map((habit) => {
              const isCompleted = getHabitCompletion(habit.id);
              const streak = habitStreaks.get(habit.id);
              const stats = habitStats.get(habit.id);
              
              return (
                <TouchableOpacity 
                  key={habit.id}
                  style={[globalStyles.card, styles.habitCard]}
                  onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitRow}>
                    <AnimatedCheckbox
                      isCompleted={isCompleted}
                      color={habit.color}
                      onToggle={() => handleToggleHabit(habit.id)}
                    />
                    <View style={styles.habitInfo}>
                      <View style={styles.habitHeader}>
                        <Text style={[typography.bodyMedium, styles.habitName]}>
                          {habit.name}
                        </Text>
                        {streak && streak.current > 0 && (
                          <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>🔥 {streak.current}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[typography.caption, styles.habitCategory]}>
                        {habit.category.name} • {isCompleted ? 'Completed today ✓' : 'Tap to complete'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Monthly Progress Section */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
          </Text>
          <View style={[globalStyles.card, styles.progressCard]}>
            <View style={styles.progressHeader}>
              <Text style={[typography.progressNumber, styles.progressPercentage]}>
                {useMemo(() => {
                  const allStats = Array.from(habitStats.values());
                  if (allStats.length === 0) return '0%';
                  const avgProgress = allStats.reduce((sum, stat) => sum + stat.monthlyProgress, 0) / allStats.length;
                  return `${Math.round(avgProgress * 100)}%`;
                }, [habitStats])}
              </Text>
              <Text style={[typography.bodySmall, styles.progressLabel]}>
                Overall completion this month
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { 
                width: (() => {
                  const allStats = Array.from(habitStats.values());
                  if (allStats.length === 0) return '0%';
                  const avgProgress = allStats.reduce((sum, stat) => sum + stat.monthlyProgress, 0) / allStats.length;
                  return `${Math.round(avgProgress * 100)}%`;
                })()
              }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  greetingSection: {
    marginBottom: spacing.lg,
  },
  greeting: {
    marginBottom: spacing.xs,
  },
  subGreeting: {
    color: colors.textSecondary,
  },
  tipCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipTitle: {
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  tipContent: {
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  tipSource: {
    fontStyle: 'italic',
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  habitCard: {
    marginBottom: spacing.sm,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  habitName: {
    flex: 1,
  },
  streakBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
  },
  habitCategory: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressCard: {
    alignItems: 'center',
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressPercentage: {
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.progressEmpty,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.progressComplete,
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.error,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.surface,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  habitProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  habitProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
});