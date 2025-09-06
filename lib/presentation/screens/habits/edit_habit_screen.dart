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

class EditHabitScreen extends StatefulWidget {
  final String habitId;
  
  const EditHabitScreen({
    super.key,
    required this.habitId,
  });

  @override
  State<EditHabitScreen> createState() => _EditHabitScreenState();
}

class _EditHabitScreenState extends State<EditHabitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String _selectedCategory = defaultCategories.first.id;
  IconData _selectedIcon = Icons.check_circle_outline;
  HabitFrequency _frequency = HabitFrequency.daily;
  TimeOfDay? _reminderTime;
  bool _isLoading = false;
  Habit? _habit;
  
  final List<IconData> _habitIcons = [
    Icons.check_circle_outline,
    Icons.fitness_center,
    Icons.favorite_outline,
    Icons.menu_book_outlined,
    Icons.eco_outlined,
    Icons.person_outline,
    Icons.people_outline,
    Icons.palette_outlined,
    Icons.local_drink,
    Icons.directions_run,
    Icons.bedtime,
    Icons.restaurant,
    Icons.phone_android,
    Icons.work,
    Icons.school,
    Icons.brush,
  ];

  @override
  void initState() {
    super.initState();
    _loadHabitData();
  }

  void _loadHabitData() {
    final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
    _habit = habitsProvider.getHabitById(widget.habitId);
    
    if (_habit != null) {
      _nameController.text = _habit!.name;
      _descriptionController.text = _habit!.description ?? '';
      _selectedCategory = _habit!.categoryId;
      _selectedIcon = _habit!.icon;
      _frequency = _habit!.frequency;
      _reminderTime = _habit!.reminderTime;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_habit == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Edit Habit'),
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
          'Edit Habit',
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
                textCapitalization: TextCapitalization.sentences,
              ),
              
              SizedBox(height: AppSpacing.sectionSpacing),
              
              // Description (Optional)
              _buildSectionTitle('Description (Optional)'),
              CustomTextField(
                controller: _descriptionController,
                label: 'What is this habit about?',
                maxLines: 3,
                prefixIcon: Icons.description,
                textCapitalization: TextCapitalization.sentences,
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
              
              // Save Button
              CustomButton(
                text: 'Save Changes',
                onPressed: _isLoading ? null : _saveHabit,
                isLoading: _isLoading,
                backgroundColor: AppColors.primary,
              ),
              
              SizedBox(height: AppSpacing.xxxl),
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
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: defaultCategories.length,
        itemBuilder: (context, index) {
          final category = defaultCategories[index];
          final isSelected = category.id == _selectedCategory;
          
          return Padding(
            padding: EdgeInsets.only(right: AppSpacing.sm),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedCategory = category.id;
                  // Update icon to match category default
                  _selectedIcon = category.icon;
                });
              },
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  color: isSelected ? category.color : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  border: Border.all(
                    color: isSelected ? category.color : AppColors.border,
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      category.icon,
                      size: 20,
                      color: isSelected ? AppColors.textLight : category.color,
                    ),
                    SizedBox(width: AppSpacing.xs),
                    Text(
                      category.name,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: isSelected ? AppColors.textLight : AppColors.textPrimary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildIconSelector() {
    return Container(
      height: 56,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _habitIcons.length,
        itemBuilder: (context, index) {
          final icon = _habitIcons[index];
          final isSelected = icon == _selectedIcon;
          final categoryColor = AppColors.getCategoryColor(_selectedCategory);
          
          return Padding(
            padding: EdgeInsets.only(right: AppSpacing.sm),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedIcon = icon;
                });
              },
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: isSelected ? categoryColor : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  border: Border.all(
                    color: isSelected ? categoryColor : AppColors.border,
                    width: 2,
                  ),
                ),
                child: Icon(
                  icon,
                  size: 28,
                  color: isSelected ? AppColors.textLight : AppColors.textSecondary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFrequencySelector() {
    final frequencies = [
      {'value': HabitFrequency.daily, 'label': 'Daily'},
      {'value': HabitFrequency.weekly, 'label': 'Weekly'},
      {'value': HabitFrequency.custom, 'label': 'Custom'},
    ];
    
    return Row(
      children: frequencies.map((freq) {
        final isSelected = freq['value'] == _frequency;
        final categoryColor = AppColors.getCategoryColor(_selectedCategory);
        
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: freq == frequencies.last ? 0 : AppSpacing.sm),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _frequency = freq['value'] as HabitFrequency;
                });
              },
              child: Container(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                decoration: BoxDecoration(
                  color: isSelected ? categoryColor : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  border: Border.all(
                    color: isSelected ? categoryColor : AppColors.border,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Text(
                    freq['label'] as String,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isSelected ? AppColors.textLight : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildReminderSelector() {
    return GestureDetector(
      onTap: () async {
        final time = await showTimePicker(
          context: context,
          initialTime: _reminderTime ?? TimeOfDay.now(),
        );
        if (time != null) {
          setState(() {
            _reminderTime = time;
          });
        }
      },
      child: Container(
        padding: EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Icon(
              Icons.alarm,
              color: _reminderTime != null ? AppColors.primary : AppColors.textMuted,
            ),
            SizedBox(width: AppSpacing.md),
            Text(
              _reminderTime != null 
                  ? 'Reminder at ${_reminderTime!.format(context)}'
                  : 'Set a daily reminder',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: _reminderTime != null ? AppColors.textPrimary : AppColors.textMuted,
              ),
            ),
            Spacer(),
            if (_reminderTime != null)
              IconButton(
                icon: Icon(Icons.clear, color: AppColors.textMuted),
                onPressed: () {
                  setState(() {
                    _reminderTime = null;
                  });
                },
              ),
          ],
        ),
      ),
    );
  }

  void _saveHabit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final habitsProvider = Provider.of<HabitsProvider>(context, listen: false);
      
      final updatedHabit = Habit(
        id: widget.habitId,
        name: _nameController.text.trim(),
        description: _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
        categoryId: _selectedCategory,
        icon: _selectedIcon,
        frequency: _frequency,
        reminderTime: _reminderTime,
        isActive: _habit!.isActive,
        createdAt: _habit!.createdAt,
        updatedAt: DateTime.now(),
        userId: _habit!.userId,
        color: AppColors.getCategoryColor(_selectedCategory),
      );
      
      await habitsProvider.updateHabit(updatedHabit);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.textLight),
                SizedBox(width: AppSpacing.sm),
                Text('Habit updated successfully!'),
              ],
            ),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update habit: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}