import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { HabitAnalyticsService } from '@/services/analytics';
import { supabase } from '@/services/supabase';
import type { StatisticsScreenProps } from '@/types';

export function StatisticsScreen({ navigation: _navigation }: StatisticsScreenProps) {
  const { habits, categories, habitStats, habitStreaks } = useStore();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [habits]);

  const loadAnalyticsData = async () => {
    if (habits.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('StatisticsScreen: Loading offline analytics data');
      
      // For offline mode, calculate data locally
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // Create chart data showing only real completion data
      const monthlyChartData = [];
      
      // Only show the current month with real data
      const currentMonthData = {
        month: currentMonth + 1,
        monthName: new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'short' }),
        completions: 0
      };
      
      // Calculate actual completions for this month only
      habitStats.forEach((stats) => {
        currentMonthData.completions += stats.totalCompletions || 0;
      });
      
      // Add 5 empty months for visual context (showing 0 completions)
      for (let i = 5; i >= 1; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const monthNum = monthDate.getMonth() + 1;
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        
        monthlyChartData.push({
          month: monthNum,
          monthName,
          completions: 0 // No fake data - show 0 for past months
        });
      }
      
      // Add current month with real data
      monthlyChartData.push(currentMonthData);
      
      // Calculate overall progress from habit stats
      const totalCompletions = Array.from(habitStats.values()).reduce((sum, stats) => sum + (stats.totalCompletions || 0), 0);
      const overallData = {
        totalCompletions,
        averageCompletion: habitStats.size > 0 ? totalCompletions / habitStats.size : 0
      };

      setMonthlyData(monthlyChartData);
      setOverallProgress(overallData);
      console.log('StatisticsScreen: Loaded analytics data', { monthlyChartData, overallData });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
  };

  const calculateOverallMonthlyProgress = () => {
    if (habitStats.size === 0) return 0;
    const allStats = Array.from(habitStats.values());
    const avgProgress = allStats.reduce((sum, stat) => sum + stat.monthlyProgress, 0) / allStats.length;
    return Math.round(avgProgress * 100);
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
    const categoryMap = new Map();
    
    categories.forEach(category => {
      const categoryHabits = habits.filter(h => h.category_id === category.id);
      if (categoryHabits.length === 0) return;
      
      const categoryProgress = categoryHabits.reduce((sum, habit) => {
        const stats = habitStats.get(habit.id);
        return sum + (stats?.monthlyProgress || 0);
      }, 0) / categoryHabits.length;
      
      categoryMap.set(category.id, {
        name: category.name,
        color: category.color,
        progress: Math.round(categoryProgress * 100)
      });
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.progress - a.progress);
  };

  const handleExportData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

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

  const categoryStats = getCategoryStats();
  const monthlyProgressPercent = calculateOverallMonthlyProgress();

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Monthly Progress Overview */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            {getCurrentMonthYear()} Overview
          </Text>
          
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
                  const isCurrentMonth = month.month === new Date().getMonth() + 1;
                  const maxCompletions = Math.max(...monthlyData.map(m => m.completions), 1);
                  // Ensure height stays within bounds - max 55px to leave room for month labels in 80px container
                  const height = Math.min(Math.max((month.completions / maxCompletions) * 55, 8), 55);
                  
                  return (
                    <View key={month.month} style={styles.chartMonth}>
                      <View style={[
                        styles.chartBar, 
                        { 
                          height: height, // Now using pixels instead of percentage
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
                  {monthlyData.length > 1 ? 
                    `${monthlyData[monthlyData.length - 1]?.completions || 0} completions this month` :
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
                {monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.completions), 0) : 0}
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
  sectionTitle: {
    marginBottom: spacing.md,
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
    gap: -4, // Negative gap to bring text closer to month labels
  },
  trendChart: {
    height: 125, // Increased box size for more space
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80, // Keep bar area height
    marginBottom: 0, // Remove margin below bars
    marginTop: 25, // Push bars down from top of container
  },
  chartMonth: {
    alignItems: 'center',
    gap: 2, // Minimal gap (2px) between bar and month label
  },
  chartBar: {
    width: 16,
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    minHeight: 8,
  },
  monthLabel: {
    color: colors.textSecondary,
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