import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { HabitAnalyticsService } from '@/services/analytics';
import { useScrollToTop } from '@/navigation/TabNavigator';
import type { StatisticsScreenProps } from '@/types';

export function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const { habits, categories, habitStats, habitStreaks, loadAllHabitsStats } = useStore();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Month selector state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Scroll to top ref
  const scrollViewRef = useRef<ScrollView>(null);

  // Register scroll function for tab navigation
  useScrollToTop('Statistics', () => {
    console.log('🔝 StatisticsScreen: Scrolling to top');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  });

  useEffect(() => {
    console.log('StatisticsScreen: Component mounted or habits changed');
    loadAnalyticsData();
  }, [habits, selectedMonth, selectedYear]);

  // Also reload analytics when habitStats change
  useEffect(() => {
    console.log('StatisticsScreen: Habit stats changed, reloading analytics');
    loadAnalyticsData();
  }, [habitStats]);

  // Load habit stats when component mounts or habits change
  useEffect(() => {
    if (habits.length > 0) {
      console.log('StatisticsScreen: Loading habit stats for', habits.length, 'habits', 'for month', selectedYear, '/', selectedMonth + 1);
      const loadStats = async () => {
        await loadAllHabitsStats(selectedMonth, selectedYear);
        // Force analytics reload after stats are loaded
        setTimeout(() => {
          console.log('StatisticsScreen: Stats loaded, reloading analytics after delay');
          loadAnalyticsData();
        }, 1000);
      };
      loadStats();
    }
  }, [habits, selectedMonth, selectedYear, loadAllHabitsStats]);

  // Recalculate category stats when habitStats change
  useEffect(() => {
    console.log('StatisticsScreen: HabitStats changed, recalculating category stats');
    const newCategoryStats = getCategoryStats();
    setCategoryStats(newCategoryStats);
  }, [habitStats, habits, categories]);

  const loadAnalyticsData = async () => {
    if (habits.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('StatisticsScreen: Loading Firebase analytics data for', habits.length, 'habits');
      
      // Get user ID from store
      const { FirebaseAuthService } = await import('@/services/firebase');
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.error('No authenticated user found for analytics');
        setIsLoading(false);
        return;
      }

      const currentYear = selectedYear;
      const currentMonth = selectedMonth;
      
      // Get monthly completion data from Firebase
      const monthlyData = await HabitAnalyticsService.getMonthlyCompletionData(currentUser.uid, currentYear);
      console.log('StatisticsScreen: Raw monthly data from Firebase:', monthlyData);
      
      // Calculate percentage data for the last 6 months
      const monthlyChartData = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const monthNum = monthDate.getMonth() + 1;
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const year = monthDate.getFullYear();
        
        // Calculate days in this month
        const daysInMonth = new Date(year, monthDate.getMonth() + 1, 0).getDate();
        
        // Calculate total possible completions for all active habits in this month
        const totalPossibleCompletions = habits.length * daysInMonth;
        
        // Get actual completions for this month from Firebase data
        const monthDataEntry = monthlyData.find(m => m.month === monthNum);
        const actualCompletions = monthDataEntry ? monthDataEntry.completions : 0;
        
        // Calculate percentage - but handle the fact that we may have historical months with different habit counts
        // For a more accurate calculation, use current number of active habits
        const habitsCountForMonth = habits.length; // Use current active habits count
        const possibleCompletionsForMonth = habitsCountForMonth * daysInMonth;
        const completionPercentage = possibleCompletionsForMonth > 0 ? 
          Math.round((actualCompletions / possibleCompletionsForMonth) * 100) : 0;
        
        console.log(`Month ${monthName}: ${actualCompletions} completions / ${possibleCompletionsForMonth} possible = ${completionPercentage}%`);
        
        monthlyChartData.push({
          month: monthNum,
          monthName,
          completions: completionPercentage,
          year: year,
          rawCompletions: actualCompletions // Keep raw data for debugging
        });
      }
      
      // Calculate overall progress from habit stats
      const totalCompletions = Array.from(habitStats.values()).reduce((sum, stats) => sum + (stats.totalCompletions || 0), 0);
      const overallData = {
        totalCompletions,
        averageCompletion: habitStats.size > 0 ? totalCompletions / habitStats.size : 0
      };

      setMonthlyData(monthlyChartData);
      setOverallProgress(overallData);
      console.log('StatisticsScreen: ✅ Final results:');
      console.log('  - Monthly chart data:', monthlyChartData);
      console.log('  - Overall progress:', overallData);
      console.log('  - HabitStats available:', habitStats.size);
      console.log('  - Total completions calculated:', totalCompletions);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMonthYear = () => {
    const date = new Date(selectedYear, selectedMonth);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = selectedYear;
    return `${month} ${year}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      // Don't allow navigation to future months
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
        if (selectedMonth === 11) {
          setSelectedMonth(0);
          setSelectedYear(selectedYear + 1);
        } else {
          setSelectedMonth(selectedMonth + 1);
        }
      }
    }
  };

  const canNavigateNext = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth);
  };

  const calculateOverallMonthlyProgress = () => {
    console.log('StatisticsScreen: Calculating overall monthly progress for', selectedYear, '/', selectedMonth + 1);
    console.log('  - HabitStats size:', habitStats.size);
    
    if (habitStats.size === 0) {
      console.log('  - No habit stats available, returning 0');
      return 0;
    }
    
    const allStats = Array.from(habitStats.values());
    console.log('  - All stats:', allStats.map(s => ({ monthly: s.monthlyProgress, total: s.totalCompletions })));
    
    const avgProgress = allStats.reduce((sum, stat) => sum + stat.monthlyProgress, 0) / allStats.length;
    const result = Math.round(avgProgress * 100);
    
    console.log('  - Average progress:', avgProgress, '-> Percentage:', result);
    return result;
  };

  const getBestStreak = () => {
    if (habitStreaks.size === 0) return 0;
    const allStreaks = Array.from(habitStreaks.values());
    return Math.max(...allStreaks.map(s => s.longest));
  };

  const getCurrentStreak = () => {
    if (habitStreaks.size === 0) return 0;
    const allStreaks = Array.from(habitStreaks.values());
    return Math.max(...allStreaks.map(s => s.current));
  };

  const getCategoryStats = () => {
    console.log('StatisticsScreen: Calculating category stats');
    console.log('- Categories:', categories.length);
    console.log('- Habits:', habits.length);
    console.log('- HabitStats size:', habitStats.size);
    
    const categoryMap = new Map();
    
    categories.forEach(category => {
      const categoryHabits = habits.filter(h => h.category_id === category.id);
      console.log(`- Category ${category.name}: ${categoryHabits.length} habits`);
      
      if (categoryHabits.length === 0) return;
      
      const categoryProgress = categoryHabits.reduce((sum, habit) => {
        const stats = habitStats.get(habit.id);
        const progress = stats?.monthlyProgress || 0;
        console.log(`  - Habit ${habit.name}: ${Math.round(progress * 100)}% monthly progress`);
        return sum + progress;
      }, 0) / categoryHabits.length;
      
      const progressPercentage = Math.round(categoryProgress * 100);
      console.log(`- Category ${category.name} total progress: ${progressPercentage}%`);
      
      categoryMap.set(category.id, {
        name: category.name,
        color: category.color,
        progress: progressPercentage
      });
    });
    
    const result = Array.from(categoryMap.values()).sort((a, b) => b.progress - a.progress);
    console.log('StatisticsScreen: Final category stats:', result);
    return result;
  };

  const handleExportData = async () => {
    try {
      // Export data functionality - can be implemented later
      console.log('Export data functionality not yet implemented for Firebase');

      // This is a simplified export - in a real app you'd generate CSV/JSON
      const exportData = {
        habits: habits.map(habit => ({
          name: habit.name,
          category: habit.category.name,
          stats: habitStats.get(habit.id),
          streaks: habitStreaks.get(habit.id)
        })),
        overallProgress,
        monthlyData,
        exportDate: new Date().toISOString()
      };

      Alert.alert(
        'Export Data',
        'Data export would be implemented here. In a production app, this would generate a CSV or JSON file.',
        [{ text: 'OK' }]
      );
      
      console.log('Export data:', exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthlyProgressPercent = calculateOverallMonthlyProgress();

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ScrollView ref={scrollViewRef} style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Monthly Progress Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h4, styles.sectionTitle]}>
              {getCurrentMonthYear()} Overview
            </Text>
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={[styles.monthNavButton, { opacity: 1 }]}
                onPress={() => navigateMonth('prev')}
              >
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.monthNavButton, { opacity: canNavigateNext() ? 1 : 0.3 }]}
                onPress={() => navigateMonth('next')}
                disabled={!canNavigateNext()}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => {
                  setIsLoading(true);
                  loadAllHabitsStats(selectedMonth, selectedYear).then(() => {
                    loadAnalyticsData();
                  });
                }}
                disabled={isLoading}
              >
                <Ionicons 
                  name="refresh" 
                  size={20} 
                  color={colors.primary} 
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[globalStyles.card, styles.overviewCard]}>
            <View style={styles.progressRingContainer}>
              <View style={styles.progressRing}>
                {/* SVG Progress Circle */}
                <Svg width="120" height="120" style={styles.progressSvg}>
                  {/* Background circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke={colors.progressEmpty}
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke={colors.primary}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - monthlyProgressPercent / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </Svg>
                
                {/* Progress text overlay */}
                <View style={styles.progressRingInner}>
                  <Text style={[typography.h2, styles.progressPercentage]}>
                    {monthlyProgressPercent}%
                  </Text>
                  <Text style={[typography.caption, styles.progressLabel]}>
                    Overall
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[typography.bodyMedium, styles.statValue]}>
                  {overallProgress?.totalCompletions || 0}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Completions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.bodyMedium, styles.statValue]}>
                  {getCurrentStreak()}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Current Streak
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[typography.bodyMedium, styles.statValue]}>
                  {habits.length}
                </Text>
                <Text style={[typography.caption, styles.statLabel]}>
                  Active Habits
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Category Performance
          </Text>
          
          <View style={[globalStyles.card, styles.categoryCard]}>
            {categoryStats.length > 0 ? categoryStats.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[typography.bodyMedium, styles.categoryName]}>
                    {category.name}
                  </Text>
                  <Text style={[typography.bodyMedium, styles.categoryPercentage]}>
                    {category.progress}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBar, 
                    { 
                      width: `${category.progress}%`, 
                      backgroundColor: category.color 
                    }
                  ]} />
                </View>
              </View>
            )) : (
              <Text style={[typography.body, styles.emptyText]}>
                No category data available yet. Complete some habits to see your progress!
              </Text>
            )}
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Year Progress
          </Text>
          
          <View style={[globalStyles.card, styles.trendCard]}>
            <View style={styles.trendChart}>
              <View style={styles.chartBars}>
                {monthlyData.length > 0 ? monthlyData.slice(-6).map((month, index) => {
                  const isCurrentMonth = month.month === new Date().getMonth() + 1 && month.year === new Date().getFullYear();
                  // Since completions is now percentage (0-100), we can use it directly with a max of 100
                  const maxHeight = 80; // Increased max height for taller bars
                  const height = Math.min(Math.max((month.completions / 100) * maxHeight, 8), maxHeight);
                  
                  return (
                    <View key={`${month.year}-${month.month}`} style={styles.chartMonth}>
                      <View style={[
                        styles.chartBar, 
                        { 
                          height: height,
                          backgroundColor: isCurrentMonth ? colors.primary : colors.textSecondary 
                        }
                      ]} />
                      <Text style={[
                        typography.caption, 
                        styles.monthLabel,
                        isCurrentMonth && styles.currentMonth
                      ]}>
                        {month.monthName}
                      </Text>
                      <Text style={[
                        typography.caption,
                        styles.percentageLabel,
                        { color: isCurrentMonth ? colors.primary : colors.textSecondary }
                      ]}>
                        {month.completions}%
                      </Text>
                    </View>
                  );
                }) : (
                  <View style={styles.emptyChart}>
                    <Text style={[typography.bodySmall, styles.emptyText]}>
                      Start tracking habits to see your progress over time!
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.trendSummary}>
              <View style={styles.trendItem}>
                <Ionicons name="trending-up" size={16} color={colors.success} />
                <Text style={[typography.bodySmall, styles.trendText]}>
                  {monthlyData.length > 0 ? 
                    `${monthlyData[monthlyData.length - 1]?.completions || 0}% completion this month` :
                    'Keep building your habits!'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Personal Records
          </Text>
          
          <View style={[globalStyles.card, styles.recordsCard]}>
            <View style={styles.recordItem}>
              <Text style={[typography.h5, styles.recordValue]}>
                {getBestStreak()} days
              </Text>
              <Text style={[typography.caption, styles.recordLabel]}>
                🔥 Longest Streak
              </Text>
            </View>
            
            <View style={styles.recordItem}>
              <Text style={[typography.h5, styles.recordValue]}>
                {monthlyProgressPercent}%
              </Text>
              <Text style={[typography.caption, styles.recordLabel]}>
                📈 This Month
              </Text>
            </View>
            
            <View style={styles.recordItem}>
              <Text style={[typography.h5, styles.recordValue]}>
                {monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.completions || 0)) : 0}%
              </Text>
              <Text style={[typography.caption, styles.recordLabel]}>
                ⚡ Best Month
              </Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity 
          style={[globalStyles.buttonSecondary, styles.exportButton]}
          onPress={handleExportData}
        >
          <Ionicons name="download-outline" size={20} color={colors.surface} style={styles.exportIcon} />
          <Text style={[globalStyles.buttonText, styles.exportButtonText]}>
            Export Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthNavButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  overviewCard: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  progressRingContainer: {
    alignItems: 'center',
  },
  progressRing: {
    width: 120,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    position: 'absolute',
  },
  progressRingInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  progressPercentage: {
    color: colors.primary,
  },
  progressLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
  categoryCard: {
    gap: spacing.md,
  },
  categoryItem: {
    gap: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    flex: 1,
  },
  categoryPercentage: {
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.progressEmpty,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  trendCard: {
    gap: spacing.md,
  },
  trendChart: {
    height: 120, // Further reduced height to move percentage labels lower and closer to bottom text
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100, // Increased height to accommodate taller bars
    marginBottom: 0, // Remove margin below bars
    marginTop: 20, // Reduced margin from top
  },
  chartMonth: {
    alignItems: 'center',
    gap: 4, // Slightly more gap for better spacing
  },
  chartBar: {
    width: 24, // Increased from 16px to 24px
    backgroundColor: colors.textSecondary,
    borderRadius: 10, // Slightly increased border radius
    minHeight: 12, // Increased minimum height
  },
  monthLabel: {
    color: colors.textSecondary,
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  currentMonth: {
    color: colors.primary,
    fontWeight: '600',
  },
  trendSummary: {
    alignItems: 'center',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendText: {
    color: colors.success,
  },
  recordsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recordItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordValue: {
    color: colors.primary,
  },
  recordLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  exportIcon: {
    marginLeft: -spacing.xs,
  },
  exportButtonText: {
    marginLeft: -spacing.xs,
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
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});