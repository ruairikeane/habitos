import 'package:flutter/material.dart';

class AppColors {
  // Light Theme Colors
  static const Color background = Color(0xFFF8F6F3);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color primary = Color(0xFF7D886E); // Sage green (from palette)
  static const Color secondary = Color(0xFF37514D); // Dark teal green
  
  // Dark Theme Colors
  static const Color backgroundDark = Color(0xFF1A1A1A);
  static const Color surfaceDark = Color(0xFF262626);
  static const Color primaryDark = Color(0xFF96A089); // Lighter sage for dark mode
  static const Color secondaryDark = Color(0xFF4A6966); // Lighter teal for dark mode
  
  // Destructive action color (for sign out button)
  static const Color destructive = Color(0xFF2D2D2D); // Black for destructive actions
  static const Color destructiveDark = Color(0xFFE57373); // Red for dark mode
  
  // Text Colors - Light Theme
  static const Color textPrimary = Color(0xFF2D2D2D);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF999999);
  
  // Text Colors - Dark Theme
  static const Color textPrimaryDark = Color(0xFFE8E8E8);
  static const Color textSecondaryDark = Color(0xFFB0B0B0);
  static const Color textMutedDark = Color(0xFF808080);
  
  // Status Colors
  static const Color success = Color(0xFF96A089); // Lighter green for success states
  static const Color error = Color(0xFFD76B6B);
  static const Color warning = Color(0xFFE6B366);
  static const Color info = Color(0xFFB8956A); // Changed from blue to warm sand
  static const Color darkEarthyOrange = Color(0xFFB87333); // Dark earthy orange for psychology
  
  // Original brown colors for sign-in page
  static const Color signInPrimary = Color(0xFF8B7355); // Original brown primary
  static const Color signInSecondary = Color(0xFFA68B5B); // Original brown secondary
  
  // UI Elements
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFF0F0F0);
  static const Color shadow = Color(0x1A000000);
  
  // Category Colors - Earth Tones (matches provided palette)
  static const Color health = Color(0xFF7D886E); // Sage green
  static const Color fitness = Color(0xFFB3803F); // Warm golden brown
  static const Color productivity = Color(0xFFD6E2D2); // Light sage
  static const Color learning = Color(0xFF87492C); // Rich brown
  static const Color mindfulness = Color(0xFFA17356); // Medium brown
  static const Color personalCare = Color(0xFF37514D); // Dark teal green
  static const Color social = Color(0xFF9A7B4F); // Extended warm brown
  static const Color creativity = Color(0xFF6B8B73); // Extended medium sage
  
  // Category Colors List for easy access
  static const List<Color> categoryColors = [
    health,
    fitness,
    productivity,
    learning,
    mindfulness,
    personalCare,
    social,
    creativity,
  ];
  
  // Category color mapping by ID
  static Color getCategoryColor(String categoryId) {
    switch (categoryId.toLowerCase()) {
      case 'health':
        return health;
      case 'fitness':
        return fitness;
      case 'productivity':
        return productivity;
      case 'learning':
        return learning;
      case 'mindfulness':
        return mindfulness;
      case 'personal-care':
        return personalCare;
      case 'social':
        return social;
      case 'creativity':
        return creativity;
      default:
        return primary;
    }
  }
  
  // Opacity Variants
  static Color primaryWithOpacity(double opacity) => primary.withOpacity(opacity);
  static Color successWithOpacity(double opacity) => success.withOpacity(opacity);
  static Color errorWithOpacity(double opacity) => error.withOpacity(opacity);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient successGradient = LinearGradient(
    colors: [success, Color(0xFF768966)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}