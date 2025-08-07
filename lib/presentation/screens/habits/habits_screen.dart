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
        actions: [
          IconButton(
            icon: Icon(
              Icons.add,
              color: AppColors.primary,
            ),
            onPressed: () {
              context.push('/habits/add');
            },
          ),
        ],
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
    );
  }

  Widget _buildHabitCard(dynamic habit) {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final isCompleted = habitsProvider.isHabitCompletedToday(habit.id);

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
                  offset: const Offset(0, 1),
                  blurRadius: 4,
                ),
              ],
            ),
            child: Row(
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
                    Text(
                      habit.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: isCompleted ? AppColors.textSecondary : AppColors.textPrimary,
                        decoration: isCompleted ? TextDecoration.lineThrough : null,
                      ),
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
              
              Icon(
                habit.icon,
                color: AppColors.getCategoryColor(habit.categoryId ?? 'general'),
                size: AppSpacing.iconMd,
              ),
            ],
          ),
        );
      },
    );
  }
}