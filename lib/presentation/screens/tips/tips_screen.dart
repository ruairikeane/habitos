import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/spacing.dart';
import '../../../core/constants/tips.dart';

class TipsScreen extends StatefulWidget {
  const TipsScreen({super.key});

  @override
  State<TipsScreen> createState() => _TipsScreenState();
}

class _TipsScreenState extends State<TipsScreen> {
  String _selectedCategory = 'all';

  Future<void> _loadData() async {
    // TODO: Refresh tips data
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Habit Tips',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Category Filter
          Container(
            height: 50,
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildCategoryChip('all', 'All Tips'),
                ...tipCategories.map((category) => _buildCategoryChip(
                  category, 
                  category.split('-').map((word) => word[0].toUpperCase() + word.substring(1)).join(' ')
                )),
              ],
            ),
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Tips List
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadData,
              child: ListView.builder(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
                physics: const AlwaysScrollableScrollPhysics(),
                itemCount: _getFilteredTips().length,
                itemBuilder: (context, index) {
                  final tip = _getFilteredTips()[index];
                  return _buildTipCard(tip);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String category, String label) {
    final isSelected = _selectedCategory == category;
    
    return Container(
      margin: EdgeInsets.only(right: AppSpacing.sm),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedCategory = category;
          });
        },
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.primary.withValues(alpha: 0.2),
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
        side: BorderSide(
          color: isSelected ? AppColors.primary : AppColors.border,
        ),
      ),
    );
  }

  Widget _buildTipCard(HabitTip tip) {
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
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: _getCategoryColor(tip.category),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
                ),
                child: Text(
                  tip.category.split('-').map((word) => word[0].toUpperCase() + word.substring(1)).join(' '),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          
          SizedBox(height: AppSpacing.md),
          
          Text(
            tip.title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith( // Changed from titleLarge
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600, // Changed from bold
            ),
          ),
          
          SizedBox(height: AppSpacing.sm),
          
          Text(
            tip.content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  List<HabitTip> _getFilteredTips() {
    if (_selectedCategory == 'all') {
      return extendedHabitTips;
    }
    return getTipsByCategory(_selectedCategory);
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'getting-started':
        return AppColors.success;
      case 'habit-stacking':
        return AppColors.primary;
      case 'environment':
        return AppColors.info;
      case 'psychology':
        return AppColors.darkEarthyOrange;
      case 'motivation':
        return AppColors.warning;
      default:
        return AppColors.textMuted;
    }
  }
}