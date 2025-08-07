import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/constants/tips.dart';
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Good morning!',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500, // Softer weight
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
        actions: [
          Consumer<AuthProvider>(
            builder: (context, auth, child) {
              return Padding(
                padding: EdgeInsets.only(right: AppSpacing.md),
                child: CircleAvatar(
                  backgroundColor: AppColors.primary,
                  radius: 18,
                  child: Text(
                    auth.user?.displayName?.substring(0, 1).toUpperCase() ?? 'U',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.textLight,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
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
                  
                  // Progress Circle
                  SizedBox(
                    width: 100,
                    child: Center(
                      child: SizedBox(
                        width: 80,
                        height: 80,
                        child: CircularProgressIndicator(
                          value: completionRate,
                          strokeWidth: 8,
                          backgroundColor: AppColors.divider,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.success),
                        ),
                      ),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Today\'s Habits',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    context.go('/habits');
                  },
                  child: Text(
                    'View All',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
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
              ...todaysHabits.take(3).map((habit) => _buildHabitQuickCard(habit)),
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
                color: isCompleted ? AppColors.success : AppColors.border,
                width: 1,
              ),
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
                        color: AppColors.warning.withValues(alpha: 0.2),
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
              
              // Milestone Achievement Badge
              if (streakMilestone != null) ...[
                SizedBox(height: AppSpacing.sm),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: streakMilestone['color'].withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                    border: Border.all(
                      color: streakMilestone['color'],
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        streakMilestone['icon'],
                        size: 14,
                        color: streakMilestone['color'],
                      ),
                      SizedBox(width: AppSpacing.xs),
                      Text(
                        streakMilestone['title'],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: streakMilestone['color'],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      );
      },
    );
  }

  void _handleHabitCompletion(HabitsProvider provider, String habitId, int currentStreak) {
    provider.toggleHabitCompletion(habitId);
    
    // Check for streak milestones and show celebration
    final newStreak = currentStreak + 1;
    final milestone = _getStreakMilestone(newStreak);
    
    if (milestone != null && [7, 14, 21, 28, 30, 35, 42, 49, 56, 90, 365].contains(newStreak)) {
      _showStreakCelebration(milestone);
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
    // TODO: Calculate actual streak from habit entries
    // For now, return a sample streak based on habit ID
    return (habitId.hashCode % 25) + 1; // Random streak 1-25
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
    final tip = getTipOfTheDay();

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
          Row(
            children: [
              Icon(
                Icons.lightbulb_outline,
                color: AppColors.warning,
                size: AppSpacing.iconMd,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Daily Tip',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.md),
          
          Text(
            tip.title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          
          SizedBox(height: AppSpacing.sm),
          
          Text(
            tip.content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}