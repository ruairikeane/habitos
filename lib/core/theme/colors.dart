import 'package:flutter/material.dart';

class AppColors {
  // Base Colors - Earth Tone Palette
  static const Color background = Color(0xFFF8F6F3);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color primary = Color(0xFF7A8471); // Darker earthy green (from React Native success color)
  static const Color secondary = Color(0xFF65715A); // Complementary darker green shade
  
  // Text Colors
  static const Color textPrimary = Color(0xFF2D2D2D);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF999999);
  
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
  
  // Category Colors - Earth Tones (matches categories.dart)
  static const Color health = Color(0xFF9CAF88); // Soft sage
  static const Color fitness = Color(0xFFA67C7C); // Dusty rose
  static const Color productivity = Color(0xFFD4B85A); // Earth yellow
  static const Color learning = Color(0xFF8FA4B2); // Dusty blue
  static const Color mindfulness = Color(0xFF9B8BA4); // Soft lavender-gray
  static const Color personalCare = Color(0xFFC4A484); // Dusty peach
  static const Color social = Color(0xFFB8956A); // Warm sand
  static const Color creativity = Color(0xFFA49B8B); // Mushroom
  
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
  static Color primaryWithOpacity(double opacity) => primary.withValues(alpha: opacity);
  static Color successWithOpacity(double opacity) => success.withValues(alpha: opacity);
  static Color errorWithOpacity(double opacity) => error.withValues(alpha: opacity);
  
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