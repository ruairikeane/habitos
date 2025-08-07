import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/constants/categories.dart';
import '../../../core/utils/validators.dart';
import '../../../data/models/habit.dart';
import '../../providers/habits_provider.dart';
import '../../widgets/common/custom_button.dart';
import '../../widgets/common/custom_text_field.dart';

class AddHabitScreen extends StatefulWidget {
  const AddHabitScreen({super.key});

  @override
  State<AddHabitScreen> createState() => _AddHabitScreenState();
}

class _AddHabitScreenState extends State<AddHabitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String _selectedCategory = defaultCategories.first.id;
  IconData _selectedIcon = Icons.check_circle_outline;
  String _frequency = 'daily';
  TimeOfDay? _reminderTime;
  
  final List<IconData> _habitIcons = [
    Icons.check_circle_outline,
    Icons.fitness_center,
    Icons.local_drink,
    Icons.menu_book,
    Icons.self_improvement,
    Icons.directions_run,
    Icons.bedtime,
    Icons.restaurant,
    Icons.phone_android,
    Icons.work,
    Icons.school,
    Icons.brush,
    Icons.music_note,
    Icons.palette,
    Icons.favorite,
    Icons.eco,
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Add Habit',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppSpacing.screenPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Habit Name
              _buildSectionTitle('Habit Name'),
              CustomTextField(
                controller: _nameController,
                label: 'Enter habit name',
                validator: Validators.validateRequired,
                prefixIcon: Icons.edit,
              ),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Description (Optional)
              _buildSectionTitle('Description (Optional)'),
              CustomTextField(
                controller: _descriptionController,
                label: 'What is this habit about?',
                maxLines: 3,
                prefixIcon: Icons.description,
              ),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Category
              _buildSectionTitle('Category'),
              _buildCategorySelector(),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Icon
              _buildSectionTitle('Icon'),
              _buildIconSelector(),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Frequency
              _buildSectionTitle('Frequency'),
              _buildFrequencySelector(),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Reminder (Optional)
              _buildSectionTitle('Reminder (Optional)'),
              _buildReminderSelector(),
              
              SizedBox(height: AppSpacing.xxxl),
              
              // Create Button
              Consumer<HabitsProvider>(
                builder: (context, habitsProvider, child) {
                  return CustomButton(
                    text: 'Create Habit',
                    onPressed: habitsProvider.isLoading ? null : _createHabit,
                    isLoading: habitsProvider.isLoading,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSpacing.md),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCategorySelector() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: defaultCategories.map((category) {
          final isSelected = _selectedCategory == category.id;
          return ListTile(
            leading: Icon(
              category.icon,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
            ),
            title: Text(
              category.name,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            trailing: isSelected
                ? Icon(Icons.check, color: AppColors.primary)
                : null,
            onTap: () {
              setState(() {
                _selectedCategory = category.id;
              });
            },
          );
        }).toList(),
      ),
    );
  }

  Widget _buildIconSelector() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.border),
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 6,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        itemCount: _habitIcons.length,
        itemBuilder: (context, index) {
          final icon = _habitIcons[index];
          final isSelected = _selectedIcon == icon;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedIcon = icon;
              });
            },
            child: Container(
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                ),
              ),
              child: Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.textMuted,
                size: 30,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFrequencySelector() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          _buildFrequencyOption('daily', 'Daily', 'Every day'),
          _buildFrequencyOption('weekly', 'Weekly', 'Once a week'),
          _buildFrequencyOption('custom', 'Custom', 'Set specific days'),
        ],
      ),
    );
  }

  Widget _buildFrequencyOption(String value, String title, String subtitle) {
    final isSelected = _frequency == value;
    return ListTile(
      title: Text(
        title,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check, color: AppColors.primary)
          : null,
      onTap: () {
        setState(() {
          _frequency = value;
        });
      },
    );
  }

  Widget _buildReminderSelector() {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(Icons.access_time, color: AppColors.primary),
          SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              _reminderTime != null
                  ? 'Remind me at ${_reminderTime!.format(context)}'
                  : 'No reminder set',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
          ),
          TextButton(
            onPressed: _selectTime,
            child: Text(
              _reminderTime != null ? 'Change' : 'Set Time',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _selectTime() async {
    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: _reminderTime ?? TimeOfDay.now(),
    );
    if (time != null) {
      setState(() {
        _reminderTime = time;
      });
    }
  }

  Future<void> _createHabit() async {
    if (!_formKey.currentState!.validate()) return;

    final selectedCategoryData = defaultCategories.firstWhere(
      (cat) => cat.id == _selectedCategory,
    );

    final habit = Habit(
      id: 'habit_${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text.trim(),
      description: _descriptionController.text.trim().isEmpty 
          ? null 
          : _descriptionController.text.trim(),
      categoryId: _selectedCategory,
      icon: _selectedIcon,
      color: selectedCategoryData.color,
      frequency: _frequency,
      reminderTime: _reminderTime,
      isActive: true,
      createdAt: DateTime.now(),
      userId: 'current-user-id', // TODO: Get from auth provider
    );

    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    await habitsProvider.addHabit(habit);

    if (mounted) {
      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.textLight),
              SizedBox(width: AppSpacing.sm),
              Text('Habit created successfully! 🎉'),
            ],
          ),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 2),
        ),
      );
      
      // Go back to habits screen
      context.pop();
    }
  }
}