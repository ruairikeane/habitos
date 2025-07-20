import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { useScrollToTop } from '@/navigation/TabNavigator';
import type { HabitsScreenProps } from '@/types';

export function HabitsScreen({ navigation }: HabitsScreenProps) {
  const { 
    habits, 
    categories, 
    isLoading, 
    error,
    habitStats,
    habitStreaks,
    loadHabits, 
    loadCategories,
    loadAllHabitsStats,
    clearError,
    resetApp,
    deleteHabit
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Scroll to top ref
  const scrollViewRef = useRef<ScrollView>(null);

  // Register scroll function for tab navigation
  useScrollToTop('Habits', () => {
    console.log('🔝 HabitsScreen: Scrolling to top');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  });

  useEffect(() => {
    console.log('HabitsScreen: useEffect triggered');
    console.log('HabitsScreen: Current state - habits:', habits.length, 'categories:', categories.length, 'isLoading:', isLoading);
    
    const loadData = async () => {
      console.log('HabitsScreen: Starting data load...');
      try {
        console.log('HabitsScreen: Calling loadHabits...');
        await loadHabits();
        console.log('HabitsScreen: Calling loadCategories...');
        await loadCategories();
        console.log('HabitsScreen: Calling loadAllHabitsStats...');
        await loadAllHabitsStats();
        console.log('HabitsScreen: Data load complete');
      } catch (error) {
        console.error('HabitsScreen: Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const filteredHabits = habits.filter(habit => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || habit.category_id === selectedCategory;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const calculateMonthlyProgress = (habitId: string) => {
    // Get real progress based on actual entries
    const stats = habitStats.get(habitId);
    if (stats) {
      return Math.round(stats.monthlyProgress * 100);
    }
    return 0; // No progress if no stats
  };

  const calculateStreak = (habitId: string) => {
    // Get real streak based on actual entries
    const streaks = habitStreaks.get(habitId);
    if (streaks) {
      return streaks.current;
    }
    return 0; // No streak if no data
  };

  const handleHabitMenu = (habit: any) => {
    Alert.alert(
      habit.name,
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: () => navigation.navigate('EditHabit', { habitId: habit.id })
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Habit',
              `Are you sure you want to delete "${habit.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => deleteHabit(habit.id)
                }
              ]
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
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
            loadCategories();
          }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.warning }]} onPress={() => {
            resetApp();
          }}>
            <Text style={styles.retryText}>Reset App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      <ScrollView ref={scrollViewRef} style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[typography.body, styles.searchInput]}
              placeholder="Search habits..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          <TouchableOpacity 
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              typography.caption, 
              styles.categoryChipText,
              selectedCategory === 'all' && styles.categoryChipTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={[
                typography.caption, 
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name.split(' ')[0]} {/* Show first word for space */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habits List */}
        <View style={styles.habitsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.bodySmall, styles.loadingText]}>
                Loading your habits...
              </Text>
            </View>
          ) : filteredHabits.length === 0 ? (
            <View style={[globalStyles.card, styles.emptyCard]}>
              <Text style={[typography.body, styles.emptyText]}>
                {selectedCategory === 'all' 
                  ? "No habits yet! Tap 'Add New Habit' to get started."
                  : "No habits in this category yet."
                }
              </Text>
            </View>
          ) : (
            filteredHabits.map((habit) => {
              const monthlyProgress = calculateMonthlyProgress(habit.id);
              const streak = calculateStreak(habit.id);
              
              // LEARNING COLOR DEBUG - Check progress bar colors
              if (habit.category.name.toLowerCase().includes('learning')) {
                console.log(`\n🟦 LEARNING PROGRESS BAR DEBUG: "${habit.name}"`);
                console.log('  Category Color for Progress Bar:', habit.category.color);
                console.log('  Expected: #8FA4B2');
                console.log('  Match:', habit.category.color === '#8FA4B2' ? '✅ CORRECT' : '❌ WRONG');
              }
              
              return (
                <TouchableOpacity 
                  key={habit.id} 
                  style={[globalStyles.card, styles.habitCard]}
                  onPress={() => {
                    navigation.navigate('HabitDetail', { habitId: habit.id });
                  }}
                >
                  <View style={styles.habitHeader}>
                    <View style={styles.habitTitleRow}>
                      <Text style={[typography.bodyMedium, styles.habitName]}>
                        {habit.name}
                      </Text>
                      <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => handleHabitMenu(habit)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[typography.caption, styles.habitMeta]}>
                      {habit.category.name} • {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.habitStats}>
                    <View style={styles.streakBadge}>
                      <Text style={[typography.captionMedium, styles.streakText]}>
                        {streak === 0 ? '🌱 New habit' : `🔥 ${streak}-day streak`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.monthlyProgress}>
                    <Text style={[typography.caption, styles.progressLabel]}>
                      This month
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[
                        styles.progressBar, 
                        { 
                          width: `${monthlyProgress}%`, 
                          backgroundColor: habit.category.color 
                        }
                      ]} />
                    </View>
                    <Text style={[typography.caption, styles.progressPercentage]}>
                      {monthlyProgress}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Add Habit Button */}
        <TouchableOpacity 
          style={[globalStyles.buttonPrimary, styles.addButton]}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Ionicons name="add" size={20} color={colors.surface} style={styles.addIcon} />
          <Text style={[globalStyles.buttonText, styles.addButtonText]}>
            Add New Habit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoryFilters: {
    marginBottom: spacing.lg,
  },
  categoryFiltersContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  habitsSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  habitCard: {
    gap: spacing.sm,
  },
  habitHeader: {
    gap: spacing.xs,
  },
  habitTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitName: {
    flex: 1,
  },
  menuButton: {
    padding: spacing.xs,
  },
  habitMeta: {
    color: colors.textSecondary,
  },
  habitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  streakText: {
    color: colors.warning,
  },
  monthlyProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressLabel: {
    minWidth: 60,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.progressEmpty,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    minWidth: 32,
    textAlign: 'right',
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addIcon: {
    marginLeft: -spacing.xs,
  },
  addButtonText: {
    marginLeft: -spacing.xs,
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
});