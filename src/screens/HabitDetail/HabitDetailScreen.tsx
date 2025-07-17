import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { HabitAnalyticsService } from '@/services/analytics';
import type { HabitDetailScreenProps } from '@/types';
import type { HabitEntry } from '@/types';

export function HabitDetailScreen({ route, navigation }: HabitDetailScreenProps) {
  const { habitId } = route.params;
  const { habits, habitStats, habitStreaks, toggleHabitCompletion } = useStore();
  
  const [calendarEntries, setCalendarEntries] = useState<HabitEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const habit = habits.find(h => h.id === habitId);
  const stats = habitStats.get(habitId);
  const streak = habitStreaks.get(habitId);

  useEffect(() => {
    if (!habit) return;
    loadCalendarData();
  }, [habit, selectedMonth]);

  const loadCalendarData = async () => {
    if (!habit) return;
    
    setIsLoading(true);
    try {
      console.log('HabitDetailScreen: Loading calendar data for offline mode');
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      // Load offline data instead of using Supabase
      const { OfflineStorageService } = await import('@/services/storage/offlineStorage');
      const offlineData = await OfflineStorageService.loadOfflineData();
      
      // Filter entries for this habit within the date range
      const entries = offlineData.habitEntries.filter(entry => {
        return entry.habit_id === habitId && 
               entry.entry_date >= startDate && 
               entry.entry_date <= endDate;
      });
      
      console.log('HabitDetailScreen: Found', entries.length, 'entries for calendar');
      setCalendarEntries(entries);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setCalendarEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    if (!habit) return null;

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = calendarEntries.find(e => e.entry_date === dateStr);
      const isCompleted = entry?.is_completed || false;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isCompleted && styles.completedDay,
            isToday && styles.todayDay,
          ]}
          onPress={() => handleDayPress(dateStr)}
        >
          <Text style={[
            styles.dayText,
            isCompleted && styles.completedDayText,
            isToday && styles.todayDayText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendar}>
        <View style={styles.weekdayHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  const handleDayPress = async (date: string) => {
    if (!habit) return;
    
    await toggleHabitCompletion(habitId, date);
    loadCalendarData(); // Refresh calendar
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  if (!habit) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={typography.h4}>Habit not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditHabit', { habitId })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[typography.h3, styles.habitTitle]}>{habit.name}</Text>
          <Text style={[typography.bodySmall, styles.categoryText]}>
            {habit.category.name}
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={[globalStyles.card, styles.statsCard]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak?.current || 0}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak?.longest || 0}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats ? Math.round(stats.monthlyProgress * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Text style={styles.navButton}>←</Text>
          </TouchableOpacity>
          <Text style={[typography.h4, styles.monthTitle]}>
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Text style={styles.navButton}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={[globalStyles.card, styles.calendarCard]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading calendar...</Text>
            </View>
          ) : (
            renderCalendar()
          )}
        </View>

        {/* Last 7 Days Progress */}
        {stats && (
          <View style={[globalStyles.card, styles.recentProgressCard]}>
            <Text style={[typography.h4, styles.sectionTitle]}>Last 7 Days</Text>
            <View style={styles.weekProgress}>
              {stats.lastSevenDays.map((completed, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                return (
                  <View key={index} style={styles.dayProgress}>
                    <View style={[
                      styles.dayProgressIndicator,
                      completed && styles.dayProgressCompleted,
                      { backgroundColor: completed ? habit.color : colors.border }
                    ]} />
                    <Text style={styles.dayProgressLabel}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Habit Details */}
        <View style={[globalStyles.card, styles.detailsCard]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Details</Text>
          
          {habit.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{habit.description}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Text>
          </View>
          
          {habit.reminder_time && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reminder:</Text>
              <Text style={styles.detailValue}>
                {new Date(`1970-01-01T${habit.reminder_time}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>
          )}
          
          {habit.habit_stacking && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Habit Stack:</Text>
              <Text style={styles.detailValue}>{habit.habit_stacking}</Text>
            </View>
          )}
          
          {habit.implementation_intention && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Implementation:</Text>
              <Text style={styles.detailValue}>{habit.implementation_intention}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButton: {
    // marginBottom: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  editButtonText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
  habitTitle: {
    marginBottom: spacing.xs,
  },
  categoryText: {
    color: colors.textSecondary,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    ...typography.h3,
    color: colors.primary,
    padding: spacing.sm,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  calendarCard: {
    marginBottom: spacing.lg,
  },
  calendar: {
    padding: spacing.sm,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  completedDay: {
    backgroundColor: colors.success,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.body,
    textAlign: 'center',
  },
  completedDayText: {
    color: colors.surface,
    fontWeight: '600',
  },
  todayDayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  recentProgressCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  weekProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayProgress: {
    alignItems: 'center',
  },
  dayProgressIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  dayProgressCompleted: {
    backgroundColor: colors.success,
  },
  dayProgressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailsCard: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});