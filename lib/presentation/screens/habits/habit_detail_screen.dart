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
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'edit') {
                    _showEditHabitDialog(context, habit);
                  } else if (value == 'delete') {
                    _showDeleteConfirmation(context, habit);
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit),
                        SizedBox(width: 8),
                        Text('Edit Habit'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete, color: Colors.red),
                        SizedBox(width: 8),
                        Text('Delete Habit', style: TextStyle(color: Colors.red)),
                      ],
                    ),
                  ),
                ],
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
                  color: AppColors.getCategoryColor(habit.categoryId).withValues(alpha: 0.2),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Completion History',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.chevron_left, color: AppColors.primary),
                    onPressed: () {
                      setState(() {
                        _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
                      });
                    },
                  ),
                  Text(
                    '${_getMonthName(_focusedMonth.month)} ${_focusedMonth.year}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
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
              _buildLegendItem('Completed', AppColors.success),
              _buildLegendItem('Incomplete', AppColors.border),
              _buildLegendItem('Today', AppColors.primary),
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
    
    if (isCompleted) {
      bgColor = AppColors.success;
      textColor = AppColors.textLight;
    } else if (isToday) {
      bgColor = AppColors.primary;
      textColor = AppColors.textLight;
    } else if (isSelected) {
      bgColor = AppColors.primary.withValues(alpha: 0.3);
      textColor = AppColors.primary;
    } else {
      bgColor = Colors.transparent;
      textColor = isPastDay ? AppColors.textMuted : AppColors.textPrimary;
    }
    
    return Container(
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: Border.all(
          color: isSelected ? AppColors.primary : 
                 isCompleted ? AppColors.success : 
                 AppColors.border.withValues(alpha: 0.3),
          width: isSelected || isCompleted ? 2 : 1,
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

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'This Month\'s Progress',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
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
                  'Completion Rate',
                  '${(completionRate * 100).toStringAsFixed(0)}%',
                  '',
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
    
    // For now, we'll only support toggling today's completion
    // In a full implementation, we'd need to create/update entries for specific dates
    final dateString = DateHelpers.formatDateForStorage(date);
    final todayString = DateHelpers.getTodayLocalDate();
    
    if (dateString == todayString) {
      habitsProvider.toggleHabitCompletion(habit.id);
    }
  }

  void _showEditHabitDialog(BuildContext context, Habit habit) {
    // For now, show a simple dialog. In a full implementation, 
    // this would navigate to an edit screen
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Habit'),
        content: const Text('Edit functionality will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
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