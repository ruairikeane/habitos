import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../providers/habits_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/scroll_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    print('🏠 HOME: Loading data...');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
      print('🏠 HOME: Calling loadHabits()');
      habitsProvider.loadHabits();
      habitsProvider.loadCategories();
    });
  }
  
  void _refreshOnFocus() {
    // Safe way to refresh when screen becomes visible
    Future.delayed(Duration.zero, () {
      final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
      habitsProvider.loadHabits();
    });
  }

  Future<void> _refreshData() async {
    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    await Future.wait([
      habitsProvider.loadHabits(),
      habitsProvider.loadCategories(),
    ]);
    
    // Also refresh focus method
    _refreshOnFocus();
    
    // Show feedback
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.refresh, color: AppColors.textLight),
              SizedBox(width: AppSpacing.sm),
              Text('Data refreshed'),
            ],
          ),
          backgroundColor: AppColors.primary,
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refreshData,
      child: Consumer<ScrollProvider>(
        builder: (context, scrollProvider, child) {
          final scrollController = scrollProvider.getScrollController('home');
          return SingleChildScrollView(
            controller: scrollController,
            padding: EdgeInsets.all(AppSpacing.screenPadding),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Daily Tip (moved to top)
                _buildDailyTip(),
                
                SizedBox(height: AppSpacing.sectionSpacing),
                
                // Today's Habits (moved to middle)
                _buildTodaysHabits(),
                
                SizedBox(height: AppSpacing.sectionSpacing),
                
                // Today's Progress Card (moved to bottom)
                _buildProgressCard(),
                
                SizedBox(height: AppSpacing.xl),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProgressCard() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final todaysHabits = habitsProvider.todaysHabits;
        final completedHabits = habitsProvider.todaysCompletedHabits;
        final completionRate = todaysHabits.isNotEmpty 
            ? completedHabits.length / todaysHabits.length 
            : 0.0;

        return Container(
          padding: EdgeInsets.all(AppSpacing.cardPadding * 1.5),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            boxShadow: [
              BoxShadow(
                color: AppColors.shadow,
                offset: const Offset(0, 2),
                blurRadius: 8,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Today\'s Progress',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              SizedBox(height: AppSpacing.md),
              
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${completedHabits.length} of ${todaysHabits.length}',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'habits completed',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Progress Circle - centered vertically
                  SizedBox(
                    width: 80,
                    height: 80,
                    child: CircularProgressIndicator(
                      value: completionRate,
                      strokeWidth: 8,
                      backgroundColor: AppColors.divider,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.success),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTodaysHabits() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final todaysHabits = habitsProvider.todaysHabits;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Today\'s Habits',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            SizedBox(height: AppSpacing.md),
            
            if (todaysHabits.isEmpty)
              Container(
                padding: EdgeInsets.all(AppSpacing.xl),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        size: 48,
                        color: AppColors.textMuted,
                      ),
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'No habits for today',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      SizedBox(height: AppSpacing.sm),
                      Text(
                        'Create your first habit to get started!',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            else
              ...todaysHabits.map((habit) => _buildHabitQuickCard(habit)),
          ],
        );
      },
    );
  }

  Widget _buildHabitQuickCard(dynamic habit) {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final isCompleted = habitsProvider.isHabitCompletedToday(habit.id);
        final streak = _calculateHabitStreak(habit.id);
        final streakMilestone = _getStreakMilestone(streak);

        return GestureDetector(
          onTap: () {
            context.push('/habits/detail/${habit.id}');
          },
          child: Container(
            margin: EdgeInsets.only(bottom: AppSpacing.sm),
            padding: EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: Border.all(
                color: isCompleted ? AppColors.success.withOpacity(0.3) : AppColors.border.withOpacity(0.2),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow.withOpacity(0.1),
                  offset: const Offset(0, 1),
                  blurRadius: 3,
                ),
              ],
            ),
            child: Column(
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () => _handleHabitCompletion(habitsProvider, habit.id, streak),
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted ? AppColors.getCategoryColor(habit.categoryId ?? 'general') : AppColors.surface,
                        border: Border.all(
                          color: isCompleted ? AppColors.getCategoryColor(habit.categoryId ?? 'general') : AppColors.textMuted,
                          width: 2,
                        ),
                      ),
                      child: isCompleted
                          ? Icon(
                              Icons.check,
                              size: 16,
                              color: AppColors.textLight,
                            )
                          : null,
                    ),
                  ),
                  
                  SizedBox(width: AppSpacing.md),
                  
                  Expanded(
                    child: Text(
                      habit.name,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: isCompleted ? AppColors.textSecondary : AppColors.textPrimary,
                        decoration: isCompleted ? TextDecoration.lineThrough : null,
                      ),
                    ),
                  ),
                  
                  // Streak Display
                  if (streak > 0) 
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.local_fire_department,
                            size: 12,
                            color: AppColors.warning,
                          ),
                          SizedBox(width: 2),
                          Text(
                            '$streak',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.warning,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                ],
              ),
              
              // Milestone Achievement Badge - aligned to left
              if (streakMilestone != null) ...[
                SizedBox(height: AppSpacing.xs),
                Row(
                  children: [
                    SizedBox(width: 24 + AppSpacing.md), // Offset to align with text
                    Icon(
                      streakMilestone['icon'],
                      size: 14,
                      color: streakMilestone['color'].withOpacity(0.8),
                    ),
                    SizedBox(width: 4),
                    Text(
                      streakMilestone['title'],
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: streakMilestone['color'].withOpacity(0.9),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      );
      },
    );
  }

  void _handleHabitCompletion(HabitsProvider provider, String habitId, int currentStreak) async {
    final wasCompleted = provider.isHabitCompletedToday(habitId);
    await provider.toggleHabitCompletion(habitId);
    
    // Only show celebration if we're completing (not uncompleting) the habit
    if (!wasCompleted) {
      // Wait a bit for the data to be updated, then recalculate streak
      await Future.delayed(const Duration(milliseconds: 100));
      final newStreak = _calculateHabitStreak(habitId);
      final milestone = _getStreakMilestone(newStreak);
      
      // Show celebration for milestone achievements
      if (milestone != null && [7, 14, 21, 28, 30, 35, 42, 49, 56, 90, 365].contains(newStreak)) {
        _showStreakCelebration(milestone);
      }
    }
  }

  void _showStreakCelebration(Map<String, dynamic> milestone) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              milestone['icon'],
              color: AppColors.textLight,
            ),
            SizedBox(width: AppSpacing.sm),
            Text(
              '🎉 ${milestone['title']} achieved!',
              style: TextStyle(
                color: AppColors.textLight,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        backgroundColor: milestone['color'],
        duration: const Duration(seconds: 3),
      ),
    );
  }

  int _calculateHabitStreak(String habitId) {
    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    
    // Calculate current streak by checking backwards from today
    int streak = 0;
    final today = DateTime.now();
    
    // Check each day backwards from today until we find an incomplete day
    for (int i = 0; i < 365; i++) { // Check up to 1 year back
      final checkDate = today.subtract(Duration(days: i));
      final dateString = '${checkDate.year}-${checkDate.month.toString().padLeft(2, '0')}-${checkDate.day.toString().padLeft(2, '0')}';
      
      if (habitsProvider.isHabitCompletedOnDate(habitId, dateString)) {
        streak++;
      } else {
        // Break on first incomplete day (streak is broken)
        break;
      }
    }
    
    return streak;
  }

  Map<String, dynamic>? _getStreakMilestone(int streak) {
    if (streak >= 365) {
      return {
        'title': 'Year Master',
        'icon': Icons.emoji_events,
        'color': AppColors.darkEarthyOrange,
      };
    } else if (streak >= 90) {
      return {
        'title': '90-Day Champion',
        'icon': Icons.military_tech,
        'color': AppColors.warning,
      };
    } else if (streak >= 56) {
      return {
        'title': '8-Week Legend',
        'icon': Icons.workspace_premium,
        'color': AppColors.darkEarthyOrange,
      };
    } else if (streak >= 49) {
      return {
        'title': '7-Week Master',
        'icon': Icons.diamond,
        'color': AppColors.primary,
      };
    } else if (streak >= 42) {
      return {
        'title': '6-Week Expert',
        'icon': Icons.auto_awesome,
        'color': AppColors.success,
      };
    } else if (streak >= 35) {
      return {
        'title': '5-Week Pro',
        'icon': Icons.trending_up,
        'color': AppColors.warning,
      };
    } else if (streak >= 30) {
      return {
        'title': 'Month Hero',
        'icon': Icons.star,
        'color': AppColors.success,
      };
    } else if (streak >= 28) {
      return {
        'title': '4-Week Champion',
        'icon': Icons.badge,
        'color': AppColors.info,
      };
    } else if (streak >= 21) {
      return {
        'title': '3-Week Achiever',
        'icon': Icons.psychology,
        'color': AppColors.darkEarthyOrange,
      };
    } else if (streak >= 14) {
      return {
        'title': '2-Week Warrior',
        'icon': Icons.shield,
        'color': AppColors.primary,
      };
    } else if (streak >= 7) {
      return {
        'title': 'Week Winner',
        'icon': Icons.grade,
        'color': AppColors.info,
      };
    }
    return null;
  }

  Widget _buildDailyTip() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        // Calculate weekly progress
        final weeklyCompleted = _calculateWeeklyCompletions(habitsProvider);
        final todaysHabits = habitsProvider.todaysHabits;
        final todaysCompleted = habitsProvider.todaysCompletedHabits;
        final yesterdayData = _getYesterdayProgress(habitsProvider);
        
        // Determine greeting message based on performance
        String mainMessage;
        String subMessage;
        IconData progressIcon;
        Color accentColor;
        
        if (weeklyCompleted == 0) {
          mainMessage = "Start your habit journey today!";
          subMessage = "Complete your first habit to build momentum";
          progressIcon = Icons.rocket_launch;
          accentColor = AppColors.primary;
        } else if (todaysCompleted.length == todaysHabits.length && todaysHabits.isNotEmpty) {
          mainMessage = "Perfect day! All ${todaysHabits.length} habits crushed! 🔥";
          subMessage = "You've completed $weeklyCompleted habits this week";
          progressIcon = Icons.celebration;
          accentColor = AppColors.success;
        } else if ((yesterdayData['total'] ?? 0) > 0 && yesterdayData['completed'] == yesterdayData['total']) {
          mainMessage = "Yesterday: ${yesterdayData['completed']}/${yesterdayData['total']} ✅ — Keep the streak alive!";
          subMessage = "Today: ${todaysCompleted.length}/${todaysHabits.length} completed";
          progressIcon = Icons.local_fire_department;
          accentColor = AppColors.warning;
        } else if (weeklyCompleted >= 20) {
          mainMessage = "You've crushed $weeklyCompleted habits this week!";
          subMessage = "Today: ${todaysCompleted.length}/${todaysHabits.length} — Keep rolling!";
          progressIcon = Icons.emoji_events;
          accentColor = AppColors.success;
        } else {
          mainMessage = "$weeklyCompleted habits completed this week";
          subMessage = todaysHabits.isEmpty 
              ? "Add some habits to track your progress" 
              : "Today: ${todaysCompleted.length}/${todaysHabits.length} — Let's go for ${todaysHabits.length}/${todaysHabits.length}!";
          progressIcon = Icons.trending_up;
          accentColor = AppColors.primary;
        }

        return Container(
          padding: EdgeInsets.all(AppSpacing.cardPadding * 1.5),
          decoration: BoxDecoration(
            color: AppColors.success,
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            boxShadow: [
              BoxShadow(
                color: AppColors.success.withOpacity(0.3),
                offset: const Offset(0, 4),
                blurRadius: 12,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: AppColors.textLight,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          offset: const Offset(0, 2),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Icon(
                      progressIcon,
                      color: AppColors.success,
                      size: 20,
                    ),
                  ),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Progress Update',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.textLight,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          _getTimeBasedGreeting(),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textLight.withOpacity(0.9),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Mini progress visualization
                  if (todaysHabits.isNotEmpty)
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 50,
                          height: 50,
                          child: CircularProgressIndicator(
                            value: todaysHabits.isEmpty ? 0 : todaysCompleted.length / todaysHabits.length,
                            strokeWidth: 4,
                            backgroundColor: AppColors.textLight.withOpacity(0.3),
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.textLight),
                          ),
                        ),
                        Text(
                          '${(todaysHabits.isEmpty ? 0 : (todaysCompleted.length / todaysHabits.length * 100)).toInt()}%',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textLight,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
              
              SizedBox(height: AppSpacing.md),
              
              Text(
                mainMessage,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.textLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              SizedBox(height: AppSpacing.sm),
              
              Text(
                subMessage,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textLight.withOpacity(0.95),
                  height: 1.5,
                ),
              ),
              
              // Weekly progress mini bar
              if (weeklyCompleted > 0) ...[
                SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 14,
                      color: AppColors.textLight.withOpacity(0.9),
                    ),
                    SizedBox(width: AppSpacing.xs),
                    Text(
                      'This week',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textLight.withOpacity(0.9),
                      ),
                    ),
                    SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.textLight.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: FractionallySizedBox(
                          widthFactor: (weeklyCompleted / 50).clamp(0.0, 1.0), // Assuming 50 habits/week is max for visualization
                          alignment: Alignment.centerLeft,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.textLight,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: AppSpacing.sm),
                    Text(
                      '$weeklyCompleted',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textLight,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }
  
  int _calculateWeeklyCompletions(HabitsProvider provider) {
    int completions = 0;
    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    
    for (int i = 0; i < now.weekday; i++) {
      final date = weekStart.add(Duration(days: i));
      final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      
      for (final habit in provider.habits) {
        if (provider.isHabitCompletedOnDate(habit.id, dateString)) {
          completions++;
        }
      }
    }
    
    return completions;
  }
  
  Map<String, int> _getYesterdayProgress(HabitsProvider provider) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    final dateString = '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';
    
    int completed = 0;
    int total = provider.habits.length;
    
    for (final habit in provider.habits) {
      if (provider.isHabitCompletedOnDate(habit.id, dateString)) {
        completed++;
      }
    }
    
    return {'completed': completed, 'total': total};
  }
  
  String _getTimeBasedGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return "Good morning! Let's make today count";
    if (hour < 17) return "Good afternoon! Keep the momentum";
    return "Good evening! Finish strong";
  }
}