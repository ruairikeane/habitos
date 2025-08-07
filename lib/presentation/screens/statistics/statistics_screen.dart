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
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: categoryColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: categoryColor.withValues(alpha: 0.4),
                          offset: const Offset(0, 1),
                          blurRadius: 3,
                        ),
                      ],
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
          
          Container(
            height: 12,
            decoration: BoxDecoration(
              color: AppColors.divider,
              borderRadius: BorderRadius.circular(6),
            ),
            child: FractionallySizedBox(
              widthFactor: progress,
              alignment: Alignment.centerLeft,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      categoryColor,
                      categoryColor.withValues(alpha: 0.8),
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(6),
                  boxShadow: [
                    BoxShadow(
                      color: categoryColor.withValues(alpha: 0.4),
                      offset: const Offset(0, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalRecordsSection() {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final records = _calculatePersonalRecords(habitsProvider);
        
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
            
            Container(
              padding: EdgeInsets.all(AppSpacing.cardPadding),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.success.withValues(alpha: 0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    offset: const Offset(0, 4),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: Column(
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
                          title: 'This Month',
                          value: '${records['thisMonthProgress']}%',
                          icon: Icons.trending_up,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  
                  SizedBox(height: AppSpacing.md),
                  
                  _buildRecordCard(
                    title: 'Best Month Ever',
                    value: '${records['bestMonthProgress']}% (${records['bestMonthName']})',
                    icon: Icons.emoji_events,
                    color: AppColors.success,
                    isWide: true,
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildRecordCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    bool isWide = false,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(
          color: color.withValues(alpha: 0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.1),
            offset: const Offset(0, 2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: isWide ? MainAxisAlignment.start : MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
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
    // Mock data for now - in a real implementation, this would calculate from historical data
    final currentMonthProgress = _calculateCurrentMonthProgress(habitsProvider);
    
    return {
      'longestStreak': 23, // Mock longest streak
      'thisMonthProgress': (currentMonthProgress * 100).toInt(),
      'bestMonthProgress': 87, // Mock best month
      'bestMonthName': 'October 2024', // Mock best month name
    };
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