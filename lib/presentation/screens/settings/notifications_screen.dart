import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _habitReminders = true;
  bool _weeklyReports = true;
  bool _achievementAlerts = true;
  bool _streakReminders = true;
  bool _motivationalQuotes = false;
  bool _socialFeatures = false;

  TimeOfDay _reminderTime = const TimeOfDay(hour: 8, minute: 0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Notifications',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () {
            // Go back to home page when back button is pressed
            context.go('/home');
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.screenPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Reminder Settings
            _buildSectionHeader('Habit Reminders'),
            _buildNotificationTile(
              icon: Icons.alarm,
              title: 'Daily Habit Reminders',
              subtitle: 'Get reminded to complete your daily habits',
              value: _habitReminders,
              onChanged: (value) => setState(() => _habitReminders = value),
            ),
            if (_habitReminders) ...[
              SizedBox(height: AppSpacing.sm),
              _buildTimePicker(),
            ],

            SizedBox(height: AppSpacing.sectionSpacing),

            // Progress Notifications
            _buildSectionHeader('Progress Updates'),
            _buildNotificationTile(
              icon: Icons.trending_up,
              title: 'Weekly Progress Reports',
              subtitle: 'Get a summary of your week every Sunday',
              value: _weeklyReports,
              onChanged: (value) => setState(() => _weeklyReports = value),
            ),
            SizedBox(height: AppSpacing.sm),
            _buildNotificationTile(
              icon: Icons.emoji_events,
              title: 'Achievement Alerts',
              subtitle: 'Celebrate when you reach milestones',
              value: _achievementAlerts,
              onChanged: (value) => setState(() => _achievementAlerts = value),
            ),
            SizedBox(height: AppSpacing.sm),
            _buildNotificationTile(
              icon: Icons.local_fire_department,
              title: 'Streak Reminders',
              subtitle: 'Don\'t break your streaks',
              value: _streakReminders,
              onChanged: (value) => setState(() => _streakReminders = value),
            ),

            SizedBox(height: AppSpacing.sectionSpacing),

            // Motivational Content
            _buildSectionHeader('Motivational Content'),
            _buildNotificationTile(
              icon: Icons.lightbulb_outline,
              title: 'Daily Motivational Quotes',
              subtitle: 'Start your day with inspiration',
              value: _motivationalQuotes,
              onChanged: (value) => setState(() => _motivationalQuotes = value),
            ),

            SizedBox(height: AppSpacing.sectionSpacing),

            // Social Features (Future)
            _buildSectionHeader('Social Features'),
            _buildNotificationTile(
              icon: Icons.people_outline,
              title: 'Social Features',
              subtitle: 'Friends, challenges, and community updates',
              value: _socialFeatures,
              onChanged: (value) => setState(() => _socialFeatures = value),
              isComingSoon: true,
            ),

            SizedBox(height: AppSpacing.sectionSpacing),

            // Notification Settings Info
            _buildInfoCard(),

            SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSpacing.md),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildNotificationTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isComingSoon = false,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: isComingSoon ? Border.all(color: AppColors.border.withOpacity(0.5)) : null,
      ),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: isComingSoon 
                ? AppColors.textMuted.withOpacity(0.1)
                : AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
          ),
          child: Icon(
            icon,
            color: isComingSoon ? AppColors.textMuted : AppColors.primary,
            size: 20,
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: isComingSoon ? AppColors.textMuted : AppColors.textPrimary,
                ),
              ),
            ),
            if (isComingSoon)
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSpacing.xs,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                ),
                child: Text(
                  'Soon',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        trailing: Switch(
          value: value,
          onChanged: isComingSoon ? null : onChanged,
          activeColor: AppColors.primary,
        ),
        contentPadding: EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
      ),
    );
  }

  Widget _buildTimePicker() {
    return Container(
      margin: EdgeInsets.only(left: AppSpacing.md),
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.schedule,
            color: AppColors.primary,
            size: 20,
          ),
          SizedBox(width: AppSpacing.sm),
          Text(
            'Remind me at',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          SizedBox(width: AppSpacing.sm),
          GestureDetector(
            onTap: _selectTime,
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Text(
                _reminderTime.format(context),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.info.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.info.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline,
            color: AppColors.info,
            size: 20,
          ),
          SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'About Notifications',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppColors.info,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: AppSpacing.xs),
                Text(
                  'Notifications help you stay consistent with your habits. You can always adjust these settings or turn them off in your device settings.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _reminderTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
              primary: AppColors.primary,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null && picked != _reminderTime) {
      setState(() {
        _reminderTime = picked;
      });
    }
  }
}