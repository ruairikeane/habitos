import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/utils/date_helpers.dart';
import '../../providers/habits_provider.dart';
import '../../../data/models/habit.dart';
import '../../../data/models/habit_entry.dart';

class HabitDetailScreen extends StatefulWidget {
  final String habitId;

  const HabitDetailScreen({
    super.key,
    required this.habitId,
  });

  @override
  State<HabitDetailScreen> createState() => _HabitDetailScreenState();
}

class _HabitDetailScreenState extends State<HabitDetailScreen> {
  DateTime _selectedDate = DateTime.now();
  DateTime _focusedMonth = DateTime.now();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadHabitData();
  }

  Future<void> _loadHabitData() async {
    setState(() {
      _isLoading = true;
    });

    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    await habitsProvider.loadHabits();
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<HabitsProvider>(
      builder: (context, habitsProvider, child) {
        final habit = habitsProvider.getHabitById(widget.habitId);

        if (habit == null) {
          return Scaffold(
            backgroundColor: AppColors.background,
            appBar: AppBar(
              title: const Text('Habit Not Found'),
              backgroundColor: AppColors.background,
              elevation: 0,
            ),
            body: const Center(
              child: Text('Habit not found'),
            ),
          );
        }

        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: Text(
              habit.name,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            backgroundColor: AppColors.background,
            elevation: 0,
            actions: [
              IconButton(
                onPressed: () => _showEditHabitDialog(context, habit),
                icon: Icon(
                  Icons.edit,
                  color: AppColors.primary,
                ),
                tooltip: 'Edit Habit',
              ),
            ],
          ),
          body: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding: EdgeInsets.all(AppSpacing.screenPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Habit Info Card
                      _buildHabitInfoCard(habit),
                      
                      SizedBox(height: AppSpacing.sectionSpacing),
                      
                      // Monthly Calendar
                      _buildMonthlyCalendar(habitsProvider, habit),
                      
                      SizedBox(height: AppSpacing.sectionSpacing),
                      
                      // Stats Section
                      _buildStatsSection(habitsProvider, habit),
                      
                      SizedBox(height: AppSpacing.xl),
                      
                      // Delete Button
                      _buildDeleteButton(context, habit),
                      
                      SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
        );
      },
    );
  }

  Widget _buildHabitInfoCard(Habit habit) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.cardPadding),
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
              Container(
                padding: EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.getCategoryColor(habit.categoryId).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Icon(
                  habit.icon,
                  color: AppColors.getCategoryColor(habit.categoryId),
                  size: 32,
                ),
              ),
              
              SizedBox(width: AppSpacing.md),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      habit.name,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (habit.description?.isNotEmpty == true) ...[ 
                      SizedBox(height: AppSpacing.xs),
                      Text(
                        habit.description!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Frequency info
          Row(
            children: [
              Icon(
                Icons.schedule,
                size: 16,
                color: AppColors.textMuted,
              ),
              SizedBox(width: AppSpacing.xs),
              Text(
                'Frequency: ${habit.frequency.value}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMonthlyCalendar(HabitsProvider habitsProvider, Habit habit) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.cardPadding),
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
          // Month navigation header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Completion History',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Icon(Icons.chevron_left, color: AppColors.primary),
                    onPressed: () {
                      setState(() {
                        _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
                      });
                    },
                  ),
                  Expanded(
                    child: Text(
                      '${_getMonthName(_focusedMonth.month)} ${_focusedMonth.year}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.chevron_right, color: AppColors.primary),
                    onPressed: () {
                      setState(() {
                        _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1);
                      });
                    },
                  ),
                ],
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Calendar
          TableCalendar<HabitEntry>(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.now().add(const Duration(days: 365)),
            focusedDay: _focusedMonth,
            selectedDayPredicate: (day) {
              return isSameDay(_selectedDate, day);
            },
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDate = selectedDay;
                _focusedMonth = focusedDay;
              });
              _toggleHabitForDate(habitsProvider, habit, selectedDay);
            },
            onPageChanged: (focusedDay) {
              setState(() {
                _focusedMonth = focusedDay;
              });
            },
            calendarFormat: CalendarFormat.month,
            headerVisible: false,
            availableGestures: AvailableGestures.all,
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) {
                return _buildCalendarDay(habitsProvider, habit, day, false, false);
              },
              selectedBuilder: (context, day, focusedDay) {
                return _buildCalendarDay(habitsProvider, habit, day, true, false);
              },
              todayBuilder: (context, day, focusedDay) {
                return _buildCalendarDay(habitsProvider, habit, day, false, true);
              },
            ),
            calendarStyle: CalendarStyle(
              outsideDaysVisible: false,
              weekendTextStyle: TextStyle(color: AppColors.textSecondary),
              defaultTextStyle: TextStyle(color: AppColors.textPrimary),
            ),
            daysOfWeekStyle: DaysOfWeekStyle(
              weekdayStyle: TextStyle(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
              weekendStyle: TextStyle(
                color: AppColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildLegendItem('Completed', AppColors.success, filled: true),
              _buildLegendItem('Incomplete', AppColors.border, filled: false),
              _buildLegendItem('Today', AppColors.primary, filled: false, isToday: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarDay(HabitsProvider habitsProvider, Habit habit, DateTime day, bool isSelected, bool isToday) {
    final dateString = DateHelpers.formatDateForStorage(day);
    final isCompleted = habitsProvider.isHabitCompletedOnDate(habit.id, dateString);
    final isPastDay = day.isBefore(DateTime.now().subtract(const Duration(days: 1)));
    
    Color bgColor;
    Color textColor;
    Color borderColor;
    double borderWidth;
    
    if (isCompleted) {
      bgColor = AppColors.success;
      textColor = AppColors.textLight;
      borderColor = AppColors.success;
      borderWidth = 2;
    } else if (isToday && !isCompleted) {
      // Today but not completed - outline only with incomplete background
      bgColor = Colors.transparent;
      textColor = AppColors.primary;
      borderColor = AppColors.primary;
      borderWidth = 2;
    } else if (isSelected) {
      bgColor = AppColors.primary.withOpacity(0.3);
      textColor = AppColors.primary;
      borderColor = AppColors.primary;
      borderWidth = 2;
    } else {
      bgColor = Colors.transparent;
      textColor = isPastDay ? AppColors.textMuted : AppColors.textPrimary;
      borderColor = AppColors.border.withOpacity(0.3);
      borderWidth = 1;
    }
    
    return Container(
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: Border.all(
          color: borderColor,
          width: borderWidth,
        ),
      ),
      child: Center(
        child: Text(
          '${day.day}',
          style: TextStyle(
            color: textColor,
            fontWeight: isCompleted || isToday || isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, {bool filled = true, bool isToday = false}) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: filled ? color : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(
              color: color,
              width: isToday ? 2 : (filled ? 0 : 1),
            ),
          ),
        ),
        SizedBox(width: AppSpacing.xs),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsSection(HabitsProvider habitsProvider, Habit habit) {
    // Calculate basic stats for current month
    final now = DateTime.now();
    final monthStart = DateTime(now.year, now.month, 1);
    final monthEnd = DateTime(now.year, now.month + 1, 0);
    
    int completedDays = 0;
    int totalPossibleDays = 0;
    
    for (int day = 1; day <= monthEnd.day; day++) {
      final checkDate = DateTime(now.year, now.month, day);
      if (checkDate.isBefore(now) || checkDate.isAtSameMomentAs(DateTime(now.year, now.month, now.day))) {
        totalPossibleDays++;
        final dateString = DateHelpers.formatDateForStorage(checkDate);
        if (habitsProvider.isHabitCompletedOnDate(habit.id, dateString)) {
          completedDays++;
        }
      }
    }
    
    final completionRate = totalPossibleDays > 0 ? (completedDays / totalPossibleDays) : 0.0;
    
    return Container(
      padding: EdgeInsets.all(AppSpacing.cardPadding),
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
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Center(
            child: Text(
              'This Month\'s Progress',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          
          SizedBox(height: AppSpacing.md),
          
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Completed',
                  '$completedDays',
                  'days',
                  AppColors.success,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Completion',
                  '${(completionRate * 100).toStringAsFixed(0)}%',
                  'rate',
                  AppColors.primary,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Total Days',
                  '$totalPossibleDays',
                  'so far',
                  AppColors.info,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String title, String value, String subtitle, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (subtitle.isNotEmpty) ...[ 
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textMuted,
            ),
          ),
        ],
        SizedBox(height: AppSpacing.xs),
        Text(
          title,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  void _toggleHabitForDate(HabitsProvider habitsProvider, Habit habit, DateTime date) {
    // Only allow marking completion for past dates and today
    final today = DateTime.now();
    if (date.isAfter(DateTime(today.year, today.month, today.day))) {
      return;
    }
    
    // Toggle completion for the selected date
    habitsProvider.toggleHabitCompletionForDate(habit.id, date);
  }

  void _showEditHabitDialog(BuildContext context, Habit habit) {
    context.push('/habits/edit/${habit.id}');
  }

  Widget _buildDeleteButton(BuildContext context, Habit habit) {
    return Center(
      child: SizedBox(
        width: 140,
        child: OutlinedButton.icon(
          onPressed: () => _showDeleteConfirmation(context, habit),
          icon: Icon(
            Icons.delete_outline,
            color: AppColors.darkEarthyOrange,
            size: 18,
          ),
          label: Text(
            'Delete Habit',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.darkEarthyOrange,
              fontWeight: FontWeight.w500,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: AppColors.darkEarthyOrange),
            padding: EdgeInsets.symmetric(
              vertical: AppSpacing.sm,
              horizontal: AppSpacing.md,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
          ),
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Habit habit) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Habit'),
        content: Text('Are you sure you want to delete "${habit.name}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
              await habitsProvider.deleteHabit(habit.id);
              if (context.mounted) {
                context.pop(); // Return to previous screen
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${habit.name} deleted'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  String _getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}