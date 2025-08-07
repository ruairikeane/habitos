import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/constants/categories.dart';
import '../../providers/habits_provider.dart';
import '../../providers/scroll_provider.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  DateTime _selectedMonth = DateTime.now();

  Future<void> _loadData() async {
    // TODO: Refresh statistics data
    await Future.delayed(const Duration(milliseconds: 500));
  }

  void _changeMonth(int delta) {
    setState(() {
      _selectedMonth = DateTime(_selectedMonth.year, _selectedMonth.month + delta, 1);
    });
  }

  String _getMonthName(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Statistics',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: Consumer<ScrollProvider>(
          builder: (context, scrollProvider, child) {
            final scrollController = scrollProvider.getScrollController('statistics');
            return SingleChildScrollView(
              controller: scrollController,
              padding: EdgeInsets.all(AppSpacing.screenPadding),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Month Navigation
                  _buildMonthNavigation(),
                  
                  SizedBox(height: AppSpacing.sectionSpacing),
                  
                  // Overview Cards
                  _buildOverviewSection(),
                  
                  SizedBox(height: AppSpacing.sectionSpacing),
                  
                  // 6-Month Progress Bar Graph
                  _buildSixMonthProgress(),
                  
                  SizedBox(height: AppSpacing.sectionSpacing),
                  
                  // Individual Habit Progress
                  _buildHabitProgressSection(),
                  
                  SizedBox(height: AppSpacing.xl),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMonthNavigation() {
    return Container(
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => _changeMonth(-1),
            icon: Icon(Icons.arrow_back_ios, color: AppColors.primary),
          ),
          Text(
            _getMonthName(_selectedMonth),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.3,
            ),
          ),
          IconButton(
            onPressed: () => _changeMonth(1),
            icon: Icon(Icons.arrow_forward_ios, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewSection() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final habits = habitsProvider.habits;
        final completedToday = habitsProvider.todaysCompletedHabits;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Overview',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
            
            SizedBox(height: AppSpacing.md),
            
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Total Habits',
                    value: '${habits.length}',
                    icon: Icons.check_circle_outline,
                    color: AppColors.primary,
                  ),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildStatCard(
                    title: 'Completed Today',
                    value: '${completedToday.length}',
                    icon: Icons.today_outlined,
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
            
            SizedBox(height: AppSpacing.md),
            
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Monthly Goal',
                    value: '${_calculateMonthlyCompletion()}%',
                    icon: Icons.trending_up,
                    color: AppColors.warning,
                  ),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildStatCard(
                    title: 'Best Streak',
                    value: '${_calculateBestStreak()} days',
                    icon: Icons.local_fire_department_outlined,
                    color: AppColors.darkEarthyOrange,
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildSixMonthProgress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '6-Month Progress',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500,
          ),
        ),
        
        SizedBox(height: AppSpacing.md),
        
        Container(
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
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: _buildSixMonthBars(),
              ),
              
              SizedBox(height: AppSpacing.md),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: _buildMonthLabels(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHabitProgressSection() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final habits = habitsProvider.habits;
        
        if (habits.isEmpty) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Habit Progress',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              
              SizedBox(height: AppSpacing.md),
              
              Container(
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
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.analytics_outlined,
                        size: 48,
                        color: AppColors.textMuted,
                      ),
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'No habits yet',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      SizedBox(height: AppSpacing.sm),
                      Text(
                        'Create habits to see your progress',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Habit Progress',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
            
            SizedBox(height: AppSpacing.md),
            
            ...habits.map((habit) => _buildHabitProgressCard(habit, habitsProvider)),
          ],
        );
      },
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.cardPadding),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: color,
                size: AppSpacing.iconSm,
              ),
              Spacer(),
            ],
          ),
          
          SizedBox(height: AppSpacing.sm),
          
          Text(
            value,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          SizedBox(height: AppSpacing.xs),
          
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildSixMonthBars() {
    final sixMonthData = _getSixMonthData();
    return sixMonthData.map((data) {
      final height = (data['percentage'] as double) * 0.6 + 10; // Much smaller bars: max 70px
      return SizedBox(
        width: 35,
        height: 70, // Fixed container height
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Container(
              width: 25,
              height: height,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.8),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  List<Widget> _buildMonthLabels() {
    final sixMonthData = _getSixMonthData();
    return sixMonthData.map((data) {
      return Column(
        children: [
          Text(
            data['label'] as String,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: AppSpacing.xs),
          Text(
            '${data['percentage'].toInt()}%',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }).toList();
  }

  List<Map<String, dynamic>> _getSixMonthData() {
    // Generate data for last 6 months
    final List<Map<String, dynamic>> data = [];
    final now = DateTime.now();
    
    for (int i = 5; i >= 0; i--) {
      final month = DateTime(now.year, now.month - i, 1);
      final monthName = _getMonthName(month).split(' ')[0].substring(0, 3);
      
      // TODO: Calculate actual completion percentage for each month
      final percentage = (50 + (i * 10) + (i % 2 == 0 ? 5 : -5)).toDouble().clamp(0, 100);
      
      data.add({
        'label': monthName,
        'percentage': percentage,
        'month': month,
      });
    }
    
    return data;
  }

  Widget _buildHabitProgressCard(dynamic habit, HabitsProvider provider) {
    final monthlyProgress = _calculateHabitMonthlyProgress(habit.id);
    final categoryColor = _getCategoryColor(habit.categoryId ?? 'general');
    
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.md),
      padding: EdgeInsets.all(AppSpacing.cardPadding),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                habit.icon ?? Icons.check_circle_outline,
                color: categoryColor,
                size: AppSpacing.iconSm,
              ),
              SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  habit.name ?? 'Unnamed Habit',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                '${monthlyProgress.toInt()}%',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: categoryColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.sm),
          
          // Progress Bar
          Container(
            height: 8,
            decoration: BoxDecoration(
              color: AppColors.divider,
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: monthlyProgress / 100,
              child: Container(
                decoration: BoxDecoration(
                  color: categoryColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
          
          SizedBox(height: AppSpacing.xs),
          
          Text(
            '${_getDaysCompletedThisMonth(habit.id)} of ${_getDaysInSelectedMonth()} days completed',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Color _getCategoryColor(String categoryId) {
    return AppColors.getCategoryColor(categoryId);
  }

  double _calculateHabitMonthlyProgress(String habitId) {
    // Calculate progress based on selected month and habit
    final monthDiff = DateTime.now().month - _selectedMonth.month;
    final baseProgress = 40 + (habitId.hashCode % 50);
    final monthVariation = (monthDiff * 10 + habitId.hashCode % 30);
    return (baseProgress + monthVariation).toDouble().clamp(0, 100);
  }

  int _getDaysCompletedThisMonth(String habitId) {
    // Calculate days completed based on progress and selected month
    final progress = _calculateHabitMonthlyProgress(habitId);
    final totalDays = _getDaysInSelectedMonth();
    return ((progress / 100) * totalDays).round();
  }

  int _getDaysInSelectedMonth() {
    final nextMonth = DateTime(_selectedMonth.year, _selectedMonth.month + 1, 1);
    final lastDayOfMonth = nextMonth.subtract(const Duration(days: 1));
    return lastDayOfMonth.day;
  }

  int _calculateMonthlyCompletion() {
    // Calculate based on selected month
    final monthDiff = DateTime.now().month - _selectedMonth.month;
    final basePercentage = 67;
    final monthVariation = (monthDiff * 15) % 40; // Vary by month
    return (basePercentage + monthVariation).clamp(0, 100);
  }

  int _calculateBestStreak() {
    // Calculate based on selected month for demo
    final monthDiff = DateTime.now().month - _selectedMonth.month;
    final baseStreak = 12;
    final monthVariation = (monthDiff * 3) % 20;
    return baseStreak + monthVariation;
  }
}