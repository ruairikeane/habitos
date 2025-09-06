import 'package:flutter/material.dart';
import '../theme/colors.dart';

class HabitCategory {
  final String id;
  final String name;
  final Color color;
  final IconData icon;

  const HabitCategory({
    required this.id,
    required this.name,
    required this.color,
    required this.icon,
  });

  factory HabitCategory.fromJson(Map<String, dynamic> json) {
    return HabitCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      color: Color(json['color'] as int),
      icon: _getIconFromString(json['icon'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color.value,
      'icon': _getIconString(icon),
    };
  }

  static IconData _getIconFromString(String iconName) {
    switch (iconName) {
      case 'heart':
        return Icons.favorite_outline;
      case 'fitness':
        return Icons.fitness_center;
      case 'checkmark-circle':
        return Icons.check_circle_outline;
      case 'book':
        return Icons.menu_book_outlined;
      case 'leaf':
        return Icons.eco_outlined;
      case 'person':
        return Icons.person_outline;
      case 'people':
        return Icons.people_outline;
      case 'color-palette':
        return Icons.palette_outlined;
      default:
        return Icons.circle_outlined;
    }
  }

  static String _getIconString(IconData icon) {
    if (icon == Icons.favorite_outline) return 'heart';
    if (icon == Icons.fitness_center) return 'fitness';
    if (icon == Icons.check_circle_outline) return 'checkmark-circle';
    if (icon == Icons.menu_book_outlined) return 'book';
    if (icon == Icons.eco_outlined) return 'leaf';
    if (icon == Icons.person_outline) return 'person';
    if (icon == Icons.people_outline) return 'people';
    if (icon == Icons.palette_outlined) return 'color-palette';
    return 'circle';
  }
}

// Default categories matching the React Native app
const List<HabitCategory> defaultCategories = [
  HabitCategory(
    id: 'health',
    name: 'Health & Wellness',
    color: Color(0xFF7D886E), // Sage green
    icon: Icons.favorite_outline,
  ),
  HabitCategory(
    id: 'fitness',
    name: 'Fitness',
    color: Color(0xFFB3803F), // Warm golden brown
    icon: Icons.fitness_center,
  ),
  HabitCategory(
    id: 'productivity',
    name: 'Productivity',
    color: Color(0xFFD6E2D2), // Light sage
    icon: Icons.check_circle_outline,
  ),
  HabitCategory(
    id: 'learning',
    name: 'Learning',
    color: Color(0xFF87492C), // Rich brown
    icon: Icons.menu_book_outlined,
  ),
  HabitCategory(
    id: 'mindfulness',
    name: 'Mindfulness',
    color: Color(0xFFA17356), // Medium brown
    icon: Icons.eco_outlined,
  ),
  HabitCategory(
    id: 'personal-care',
    name: 'Personal Care',
    color: Color(0xFF37514D), // Dark teal green
    icon: Icons.person_outline,
  ),
  HabitCategory(
    id: 'social',
    name: 'Social',
    color: Color(0xFF9A7B4F), // Extended warm brown
    icon: Icons.people_outline,
  ),
  HabitCategory(
    id: 'creativity',
    name: 'Creative',
    color: Color(0xFF6B8B73), // Extended medium sage
    icon: Icons.palette_outlined,
  ),
];

// Category color mapping for easy access
const Map<String, Color> categoryColorMap = {
  'Health & Wellness': Color(0xFF9CAF88),
  'Fitness': Color(0xFFA67C7C),
  'Productivity': Color(0xFFD4B85A),
  'Learning': Color(0xFF8FA4B2),
  'Mindfulness': Color(0xFF9B8BA4),
  'Personal Care': Color(0xFFC4A484),
  'Social': Color(0xFFB8956A),
  'Creative': Color(0xFFA49B8B),
};

// Get category color by name
Color getCategoryColor(String categoryName) {
  return categoryColorMap[categoryName] ?? AppColors.primary;
}

// Get category by name
HabitCategory? getCategoryByName(String categoryName) {
  try {
    return defaultCategories.firstWhere(
      (category) => category.name == categoryName,
    );
  } catch (e) {
    return null;
  }
}

// Get all category names
List<String> getAllCategoryNames() {
  return defaultCategories.map((category) => category.name).toList();
}