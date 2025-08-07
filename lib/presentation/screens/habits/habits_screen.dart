import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../providers/habits_provider.dart';
import '../../providers/scroll_provider.dart';

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({super.key});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  @override
  void initState() {
    super.initState();
    // Use postFrameCallback to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDataSafe();
    });
  }
  
  Future<void> _loadDataSafe() async {
    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    await habitsProvider.loadHabits();
    await habitsProvider.loadCategories();
  }
  
  Future<void> _loadData() async {
    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    await habitsProvider.loadHabits();
    await habitsProvider.loadCategories();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'My Habits',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: Consumer<HabitsProvider>(
        builder: (context, habitsProvider, child) {
          if (habitsProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final habits = habitsProvider.habits;

          if (habits.isEmpty) {
            return RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height - 200,
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.screenPadding),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 64,
                            color: AppColors.textMuted,
                          ),
                          SizedBox(height: AppSpacing.lg),
                          Text(
                            'No Habits Yet',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          SizedBox(height: AppSpacing.sm),
                          Text(
                            'Create your first habit to start building better routines!',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.textMuted,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: AppSpacing.xl),
                          ElevatedButton.icon(
                            onPressed: () {
                              context.push('/habits/add');
                            },
                            icon: const Icon(Icons.add),
                            label: const Text('Create First Habit'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadData,
            child: Consumer<ScrollProvider>(
              builder: (context, scrollProvider, child) {
                final scrollController = scrollProvider.getScrollController('habits');
                return ListView.builder(
                  controller: scrollController,
                  padding: EdgeInsets.all(AppSpacing.screenPadding),
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: habits.length,
                  itemBuilder: (context, index) {
                    final habit = habits[index];
                    return _buildHabitCard(habit);
                  },
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.push('/habits/add');
        },
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textLight,
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildHabitCard(dynamic habit) {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final isCompleted = habitsProvider.isHabitCompletedToday(habit.id);
        final monthlyProgress = _calculateMonthlyProgress(habitsProvider, habit.id);

        return GestureDetector(
          onTap: () {
            context.push('/habits/detail/${habit.id}');
          },
          child: Container(
            margin: EdgeInsets.only(bottom: AppSpacing.md),
            padding: EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow,
                  offset: const Offset(0, 2),
                  blurRadius: 8,
                ),
              ],
            ),
            child: Column(
              children: [
                // Main habit info row
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => habitsProvider.toggleHabitCompletion(habit.id),
                      child: Container(
                        width: 28,
                        height: 28,
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
                                size: 18,
                                color: AppColors.textLight,
                              )
                            : null,
                      ),
                    ),
                    
                    SizedBox(width: AppSpacing.md),
                    
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  habit.name,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: isCompleted ? AppColors.textSecondary : AppColors.textPrimary,
                                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Text(
                                '${(monthlyProgress * 100).toInt()}%',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: AppColors.getCategoryColor(habit.categoryId ?? 'general'),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          if (habit.description?.isNotEmpty == true) ...[
                            SizedBox(height: AppSpacing.xs),
                            Text(
                              habit.description!,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.textMuted,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    
                    SizedBox(width: AppSpacing.sm),
                    
                    Container(
                      padding: EdgeInsets.all(AppSpacing.xs),
                      decoration: BoxDecoration(
                        color: AppColors.getCategoryColor(habit.categoryId ?? 'general').withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                      ),
                      child: Icon(
                        habit.icon,
                        color: AppColors.getCategoryColor(habit.categoryId ?? 'general'),
                        size: 20,
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: AppSpacing.sm),
                
                // Monthly progress bar
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'This Month',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: AppSpacing.xs),
                    Container(
                      height: 8,
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: FractionallySizedBox(
                        widthFactor: monthlyProgress,
                        alignment: Alignment.centerLeft,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                AppColors.getCategoryColor(habit.categoryId ?? 'general'),
                                AppColors.getCategoryColor(habit.categoryId ?? 'general').withValues(alpha: 0.7),
                              ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(4),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.getCategoryColor(habit.categoryId ?? 'general').withValues(alpha: 0.3),
                                offset: const Offset(0, 1),
                                blurRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  double _calculateMonthlyProgress(HabitsProvider habitsProvider, String habitId) {
    final now = DateTime.now();
    final daysPassed = now.day;
    
    int completedDays = 0;
    for (int day = 1; day <= daysPassed; day++) {
      final date = DateTime(now.year, now.month, day);
      final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      if (habitsProvider.isHabitCompletedOnDate(habitId, dateString)) {
        completedDays++;
      }
    }
    
    return daysPassed > 0 ? completedDays / daysPassed : 0.0;
  }
}