import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { EXTENDED_HABIT_TIPS } from '@/services/defaultData';
import { AnimatedCheckbox, StreakCelebration } from '@/components/common';
import { useDateTracker } from '@/hooks';
import { getTodayLocalDate } from '@/utils/dateHelpers';
import { useScrollToTop } from '@/navigation/TabNavigator';
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
    clearError,
    oneTimeLearningFix
  } = useStore();

  const [currentTip, setCurrentTip] = useState(0);
  const [celebrationStreak, setCelebrationStreak] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Track date changes for midnight reset
  const { currentDate, hasDateChanged, resetDateChange } = useDateTracker();
  
  // Debug: Track changes to today's entries
  useEffect(() => {
    console.log('\n🔄 === TODAY\'S ENTRIES CHANGED ===');
    console.log('New todaysEntries count:', todaysEntries.length);
    if (todaysEntries.length > 0) {
      console.log('Updated entries:');
      todaysEntries.forEach((entry, index) => {
        console.log(`  ${index + 1}. Habit: ${entry.habit_id} | Date: ${entry.entry_date} | Completed: ${entry.is_completed}`);
      });
    }
    console.log('🔄 === ENTRIES UPDATE COMPLETE ===\n');
  }, [todaysEntries]);
  
  // Scroll to top ref
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log('\n🏠 === HOME SCREEN MOUNTING ===');
    console.log('HomeScreen: Loading habits and today\'s entries...');
    const loadData = async () => {
      await loadHabits();
      await loadTodaysEntries();
      console.log('\n📊 HOME SCREEN DATA LOADED:');
      console.log('  - Habits:', habits.length);
      console.log('  - Today\'s entries:', todaysEntries.length);
      console.log('  - Today\'s date:', getTodayLocalDate());
      
      if (todaysEntries.length > 0) {
        console.log('\n📅 TODAY\'S ENTRIES DETAILS:');
        todaysEntries.forEach((entry, index) => {
          console.log(`  ${index + 1}. Habit: ${entry.habit_id} | Date: ${entry.entry_date} | Completed: ${entry.is_completed}`);
        });
      } else {
        console.log('\n⚠️ NO TODAY\'S ENTRIES FOUND');
      }

      // FORCE LEARNING COLOR FIX (temporarily forcing it to run again)
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      console.log('\n🎯 FORCING Learning category color fix to run again...');
      try {
        // Clear the flag to force it to run
        await AsyncStorage.removeItem('learning_color_fix_completed');
        await oneTimeLearningFix();
        await AsyncStorage.setItem('learning_color_fix_completed', 'true');
        console.log('✅ FORCED Learning color fix completed');
      } catch (error) {
        console.error('❌ FORCED Learning fix failed:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Rotate tips daily
    const tipIndex = new Date().getDate() % EXTENDED_HABIT_TIPS.length;
    setCurrentTip(tipIndex);
  }, []);

  // Register scroll function for tab navigation
  useScrollToTop('Home', () => {
    console.log('🔝 HomeScreen: Scrolling to top');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  });

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
    const entry = todaysEntries.find(entry => 
      entry.habit_id === habitId && entry.entry_date === today
    );
    const isCompleted = entry?.is_completed || false;
    
    // Debug logging for completion state
    if (habitId) {
      console.log(`HomeScreen: getHabitCompletion(${habitId})`);
      console.log('  - Today\'s date:', today);
      console.log('  - Total today\'s entries:', todaysEntries.length);
      console.log('  - Entry found:', entry ? 'YES' : 'NO');
      console.log('  - Is completed:', isCompleted);
      
      if (todaysEntries.length > 0) {
        console.log('  - All entries for today:');
        todaysEntries.forEach((e, index) => {
          console.log(`    ${index + 1}. Habit: ${e.habit_id} | Date: ${e.entry_date} | Completed: ${e.is_completed}`);
        });
      }
    }
    
    return isCompleted;
  };

  const handleToggleHabit = useCallback(async (habitId: string) => {
    const wasCompleted = getHabitCompletion(habitId);
    console.log('\n🏠 HomeScreen: Toggling habit', habitId, 'from', wasCompleted, 'to', !wasCompleted);
    
    await toggleHabitCompletion(habitId, today);
    
    // 🔄 CRITICAL FIX: Reload today's entries to refresh the HomeScreen
    console.log('🏠 HomeScreen: Reloading today\'s entries after toggle...');
    await loadTodaysEntries();
    console.log('🏠 HomeScreen: Today\'s entries reloaded');
    
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
  }, [getHabitCompletion, toggleHabitCompletion, today, habitStreaks, loadTodaysEntries]);

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
      <ScrollView ref={scrollViewRef} style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
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
              
              // LEARNING COLOR DEBUG - Check what's actually being passed to AnimatedCheckbox
              if (habit.category.name.toLowerCase().includes('learning')) {
                console.log(`\n🔵 LEARNING HABIT DEBUG: "${habit.name}"`);
                console.log('  Category Name:', habit.category.name);
                console.log('  Category Color:', habit.category.color);
                console.log('  Category ID:', habit.category.id);
                console.log('  Expected Color: #8FA4B2');
                console.log('  Color Match:', habit.category.color === '#8FA4B2' ? '✅ CORRECT' : '❌ WRONG');
              }
              
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
                      color={habit.category.color}
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