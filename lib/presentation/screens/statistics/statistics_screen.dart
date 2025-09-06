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
    return RefreshIndicator(
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
                
                // Monthly Progress Bar Graph
                _buildMonthlyProgress(),
                
                SizedBox(height: AppSpacing.sectionSpacing),
                
                // Category Progress
                _buildCategoryProgressSection(),
                
                SizedBox(height: AppSpacing.sectionSpacing),
                
                // Personal Records
                _buildPersonalRecordsSection(),
                
                SizedBox(height: AppSpacing.xl),
              ],
            ),
          );
        },
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
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
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
        
        // Calculate data for the selected month
        final now = DateTime.now();
        final isCurrentMonth = _selectedMonth.year == now.year && _selectedMonth.month == now.month;
        
        // Calculate completed for selected month
        int monthlyCompleted = 0;
        int totalPossibleDays = 0;
        final monthEnd = DateTime(_selectedMonth.year, _selectedMonth.month + 1, 0);
        final lastDay = isCurrentMonth ? now.day : monthEnd.day;
        
        for (final habit in habits) {
          for (int day = 1; day <= lastDay; day++) {
            final date = DateTime(_selectedMonth.year, _selectedMonth.month, day);
            final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
            
            totalPossibleDays++;
            if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
              monthlyCompleted++;
            }
          }
        }
        
        final completedToday = isCurrentMonth ? habitsProvider.todaysCompletedHabits.length : 0;
        final monthlyPercentage = totalPossibleDays > 0 
            ? ((monthlyCompleted / totalPossibleDays) * 100).toInt()
            : 0;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Overview',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
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
                    color: AppColors.health, // Sage green
                  ),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildStatCard(
                    title: isCurrentMonth ? 'Completed Today' : 'Month Total',
                    value: isCurrentMonth ? '$completedToday' : '$monthlyCompleted',
                    icon: isCurrentMonth ? Icons.today_outlined : Icons.calendar_month,
                    color: AppColors.fitness, // Warm golden brown
                  ),
                ),
              ],
            ),
            
            SizedBox(height: AppSpacing.md),
            
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Monthly Progress',
                    value: '$monthlyPercentage%',
                    icon: Icons.trending_up,
                    color: AppColors.mindfulness, // Medium brown
                  ),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: _buildStatCard(
                    title: 'Best Streak',
                    value: '${_calculateBestStreak()} days',
                    icon: Icons.local_fire_department_outlined,
                    color: AppColors.learning, // Rich brown
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildMonthlyProgress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Monthly Progress',
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
                children: _buildMonthlyBars(),
              ),
              
              SizedBox(height: AppSpacing.md),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: _buildMonthlyLabels(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryProgressSection() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final habits = habitsProvider.habits;
        final categoryProgress = _calculateCategoryProgress(habits, habitsProvider);
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Category Progress',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            SizedBox(height: AppSpacing.md),
            
            Container(
              padding: EdgeInsets.all(AppSpacing.cardPadding),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    offset: const Offset(0, 2),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Column(
                children: categoryProgress.isEmpty
                    ? [
                        Center(
                          child: Padding(
                            padding: EdgeInsets.all(AppSpacing.xl),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.category_outlined,
                                  size: 48,
                                  color: AppColors.textMuted,
                                ),
                                SizedBox(height: AppSpacing.md),
                                Text(
                                  'No habits to analyze',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                SizedBox(height: AppSpacing.sm),
                                Text(
                                  'Create some habits to see category progress',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ]
                    : categoryProgress.entries.map((entry) {
                        return _buildCategoryProgressBar(entry.key, entry.value);
                      }).toList(),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCategoryProgressBar(String categoryId, Map<String, dynamic> data) {
    final categoryColor = AppColors.getCategoryColor(categoryId);
    final progress = data['progress'] as double;
    final habitCount = data['habitCount'] as int;
    final categoryName = _getCategoryName(categoryId);
    final categoryIcon = _getCategoryIcon(categoryId);
    
    return Padding(
      padding: EdgeInsets.only(bottom: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: categoryColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      categoryIcon,
                      size: 16,
                      color: categoryColor,
                    ),
                  ),
                  SizedBox(width: AppSpacing.sm),
                  Text(
                    categoryName,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: AppSpacing.xs),
                  Text(
                    '($habitCount ${habitCount == 1 ? 'habit' : 'habits'})',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: categoryColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.sm),
          
          Stack(
            children: [
              // Background bar that goes all the way across
              Container(
                height: 5,
                decoration: BoxDecoration(
                  color: categoryColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(2.5),
                ),
              ),
              // Progress bar on top
              FractionallySizedBox(
                widthFactor: progress,
                alignment: Alignment.centerLeft,
                child: Container(
                  height: 5,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        categoryColor,
                        categoryColor.withOpacity(0.8),
                      ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(2.5),
                    boxShadow: [
                      BoxShadow(
                        color: categoryColor.withOpacity(0.3),
                        offset: const Offset(0, 1),
                        blurRadius: 2,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalRecordsSection() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final records = _calculatePersonalRecords(habitsProvider);
        final perfectDays = _calculatePerfectDaysThisMonth(habitsProvider);
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal Records',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            
            SizedBox(height: AppSpacing.md),
            
            Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildRecordCard(
                        title: 'Longest Streak',
                        value: '${records['longestStreak']} days',
                        icon: Icons.local_fire_department,
                        color: AppColors.warning,
                      ),
                    ),
                    SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _buildRecordCard(
                        title: 'Perfect Days',
                        value: '$perfectDays this month',
                        icon: Icons.star,
                        color: AppColors.darkEarthyOrange,
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: AppSpacing.md),
                
                Row(
                  children: [
                    Expanded(
                      child: _buildRecordCard(
                        title: 'This Month',
                        value: '${records['thisMonthProgress']}%',
                        icon: Icons.trending_up,
                        color: AppColors.primary,
                      ),
                    ),
                    SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _buildRecordCard(
                        title: 'Best Month',
                        value: '${records['bestMonthProgress']}%',
                        subtitle: records['bestMonthName'],
                        icon: Icons.emoji_events,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        );
      },
    );
  }
  
  int _calculatePerfectDaysThisMonth(HabitsProvider habitsProvider) {
    final habits = habitsProvider.habits;
    if (habits.isEmpty) return 0;
    
    final now = DateTime.now();
    int perfectDays = 0;
    
    for (int day = 1; day <= now.day; day++) {
      final date = DateTime(now.year, now.month, day);
      final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      
      bool allCompleted = true;
      for (final habit in habits) {
        if (!habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          allCompleted = false;
          break;
        }
      }
      
      if (allCompleted) {
        perfectDays++;
      }
    }
    
    return perfectDays;
  }

  Widget _buildRecordCard({
    required String title,
    required String value,
    String? subtitle,
    required IconData icon,
    required Color color,
    bool isWide = false,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md * 1.2),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.15),
            offset: const Offset(0, 8),
            blurRadius: 24,
          ),
          BoxShadow(
            color: AppColors.shadow.withOpacity(0.1),
            offset: const Offset(0, 4),
            blurRadius: 12,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: isWide ? MainAxisAlignment.start : MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(AppSpacing.sm * 1.2),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      color.withOpacity(0.2),
                      color.withOpacity(0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.2),
                      offset: const Offset(0, 2),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 22,
                ),
              ),
              if (isWide) ...[
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: AppSpacing.xs),
                      Text(
                        value,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: color,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (subtitle != null) ...[
                        SizedBox(height: AppSpacing.xxs),
                        Text(
                          subtitle,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ],
          ),
          
          if (!isWide) ...[
            SizedBox(height: AppSpacing.sm),
            
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            
            SizedBox(height: AppSpacing.xs),
            
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            
            if (subtitle != null) ...[
              SizedBox(height: AppSpacing.xxs),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ],
      ),
    );
  }

  Map<String, Map<String, dynamic>> _calculateCategoryProgress(List habits, HabitsProvider habitsProvider) {
    final Map<String, Map<String, dynamic>> categoryData = {};
    
    for (final habit in habits) {
      final categoryId = habit.categoryId ?? 'general';
      if (!categoryData.containsKey(categoryId)) {
        categoryData[categoryId] = {
          'habitCount': 0,
          'completedDays': 0,
          'totalPossibleDays': 0,
        };
      }
      
      categoryData[categoryId]!['habitCount']++;
      
      // Calculate progress for current month
      final now = DateTime.now();
      final daysPassed = now.day;
      
      int habitCompletedDays = 0;
      for (int day = 1; day <= daysPassed; day++) {
        final date = DateTime(now.year, now.month, day);
        final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          habitCompletedDays++;
        }
      }
      
      categoryData[categoryId]!['completedDays'] += habitCompletedDays;
      categoryData[categoryId]!['totalPossibleDays'] += daysPassed;
    }
    
    // Calculate progress percentages
    final Map<String, Map<String, dynamic>> result = {};
    categoryData.forEach((categoryId, data) {
      final totalPossible = data['totalPossibleDays'] as int;
      final completed = data['completedDays'] as int;
      final progress = totalPossible > 0 ? completed / totalPossible : 0.0;
      
      result[categoryId] = {
        'habitCount': data['habitCount'],
        'progress': progress,
        'completedDays': completed,
        'totalPossibleDays': totalPossible,
      };
    });
    
    return result;
  }

  Map<String, dynamic> _calculatePersonalRecords(HabitsProvider habitsProvider) {
    final habits = habitsProvider.habits;
    
    // Calculate longest streak across all habits
    int longestStreak = 0;
    for (final habit in habits) {
      int currentStreak = _calculateHabitStreak(habit.id, habitsProvider);
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }
    
    // Calculate current month progress
    final currentMonthProgress = _calculateCurrentMonthProgress(habitsProvider);
    
    // Calculate best month ever by checking last 12 months
    double bestMonthProgress = currentMonthProgress;
    String bestMonthName = _getMonthYearString(DateTime.now());
    
    final now = DateTime.now();
    for (int monthsBack = 1; monthsBack <= 12; monthsBack++) {
      final checkDate = DateTime(now.year, now.month - monthsBack, 1);
      final monthProgress = _calculateMonthProgress(checkDate, habitsProvider);
      
      if (monthProgress > bestMonthProgress) {
        bestMonthProgress = monthProgress;
        bestMonthName = _getMonthYearString(checkDate);
      }
    }
    
    return {
      'longestStreak': longestStreak,
      'thisMonthProgress': (currentMonthProgress * 100).toInt(),
      'bestMonthProgress': (bestMonthProgress * 100).toInt(),
      'bestMonthName': bestMonthName,
    };
  }
  
  int _calculateHabitStreak(String habitId, HabitsProvider habitsProvider) {
    int streak = 0;
    final today = DateTime.now();
    
    // Check each day backwards from today until we find an incomplete day
    for (int i = 0; i < 365; i++) { // Check up to 1 year back
      final checkDate = today.subtract(Duration(days: i));
      final dateString = '${checkDate.year}-${checkDate.month.toString().padLeft(2, '0')}-${checkDate.day.toString().padLeft(2, '0')}';
      
      if (habitsProvider.isHabitCompletedOnDate(habitId, dateString)) {
        streak++;
      } else {
        // If today isn't checked yet but yesterday was, don't break the streak
        if (i == 0 && streak > 0) {
          continue;
        }
        break;
      }
    }
    
    return streak;
  }
  
  double _calculateMonthProgress(DateTime month, HabitsProvider habitsProvider) {
    final habits = habitsProvider.habits;
    if (habits.isEmpty) return 0.0;
    
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final now = DateTime.now();
    final isCurrentMonth = month.year == now.year && month.month == now.month;
    final daysToCounts = isCurrentMonth ? now.day : daysInMonth;
    
    int totalCompletedDays = 0;
    int totalPossibleDays = 0;
    
    for (final habit in habits) {
      // Only count habits that existed during this month
      // For simplicity, we'll count all habits for now
      for (int day = 1; day <= daysToCounts; day++) {
        final date = DateTime(month.year, month.month, day);
        final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          totalCompletedDays++;
        }
        totalPossibleDays++;
      }
    }
    
    return totalPossibleDays > 0 ? totalCompletedDays / totalPossibleDays : 0.0;
  }
  
  String _getMonthYearString(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  double _calculateCurrentMonthProgress(HabitsProvider habitsProvider) {
    final habits = habitsProvider.habits;
    if (habits.isEmpty) return 0.0;
    
    final now = DateTime.now();
    final daysPassed = now.day;
    int totalCompletedDays = 0;
    int totalPossibleDays = 0;
    
    for (final habit in habits) {
      for (int day = 1; day <= daysPassed; day++) {
        final date = DateTime(now.year, now.month, day);
        final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          totalCompletedDays++;
        }
        totalPossibleDays++;
      }
    }
    
    return totalPossibleDays > 0 ? totalCompletedDays / totalPossibleDays : 0.0;
  }

  String _getCategoryName(String categoryId) {
    final category = defaultCategories.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => defaultCategories.first,
    );
    return category.name;
  }

  IconData _getCategoryIcon(String categoryId) {
    final category = defaultCategories.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => defaultCategories.first,
    );
    return category.icon;
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

  List<Widget> _buildMonthlyBars() {
    final monthlyData = _getMonthlyData();
    return monthlyData.map((data) {
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
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary,
                    AppColors.primary.withOpacity(0.7),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(3),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    offset: const Offset(0, 2),
                    blurRadius: 4,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  List<Widget> _buildMonthlyLabels() {
    final monthlyData = _getMonthlyData();
    return monthlyData.map((data) {
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

  List<Map<String, dynamic>> _getMonthlyData() {
    final List<Map<String, dynamic>> data = [];
    final now = DateTime.now();
    final currentYear = now.year;
    final currentMonth = now.month;
    final habitsProvider = context.watch<HabitsProvider>();
    
    // Generate data for current month and 5 months prior (6 months total)
    for (int i = -5; i <= 0; i++) {
      final month = DateTime(currentYear, currentMonth + i, 1);
      final monthName = _getMonthName(month).split(' ')[0].substring(0, 3);
      
      final percentage = _calculateMonthProgress(month, habitsProvider);
      
      data.add({
        'label': monthName,
        'percentage': percentage,
        'month': month,
      });
    }
    
    return data;
  }

  int _calculateMonthlyCompletion() {
    final habitsProvider = context.watch<HabitsProvider>();
    final habits = habitsProvider.habits;
    if (habits.isEmpty) return 0;
    
    final selectedYear = _selectedMonth.year;
    final selectedMonthNum = _selectedMonth.month;
    final today = DateTime.now();
    
    // Only count days up to today if it's the current month
    final lastDayToCount = (selectedYear == today.year && selectedMonthNum == today.month) 
        ? today.day 
        : DateTime(selectedYear, selectedMonthNum + 1, 0).day;
    
    int totalPossibleCompletions = 0;
    int actualCompletions = 0;
    
    for (final habit in habits) {
      for (int day = 1; day <= lastDayToCount; day++) {
        final date = DateTime(selectedYear, selectedMonthNum, day);
        final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        
        totalPossibleCompletions++;
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          actualCompletions++;
        }
      }
    }
    
    return totalPossibleCompletions > 0 
        ? ((actualCompletions / totalPossibleCompletions) * 100).round() 
        : 0;
  }

  int _calculateBestStreak() {
    final habitsProvider = context.watch<HabitsProvider>();
    final habits = habitsProvider.habits;
    if (habits.isEmpty) return 0;
    
    int maxStreak = 0;
    
    for (final habit in habits) {
      int currentStreak = 0;
      int bestStreakForHabit = 0;
      
      // Check the last 90 days for streaks
      final endDate = DateTime.now();
      final startDate = endDate.subtract(const Duration(days: 90));
      
      for (int i = 0; i <= 90; i++) {
        final date = startDate.add(Duration(days: i));
        final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          currentStreak++;
          bestStreakForHabit = currentStreak > bestStreakForHabit ? currentStreak : bestStreakForHabit;
        } else {
          currentStreak = 0;
        }
      }
      
      maxStreak = bestStreakForHabit > maxStreak ? bestStreakForHabit : maxStreak;
    }
    
    return maxStreak;
  }
}