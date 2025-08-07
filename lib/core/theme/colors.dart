import 'package:flutter/material.dart';

class AppColors {
  // Base Colors - Earth Tone Palette
  static const Color background = Color(0xFFF8F6F3);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color primary = Color(0xFF8B7355);
  static const Color secondary = Color(0xFFA68B5B);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF2D2D2D);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF999999);
  
  // Status Colors
  static const Color success = Color(0xFF7A8471);
  static const Color error = Color(0xFFD76B6B);
  static const Color warning = Color(0xFFE6B366);
  static const Color info = Color(0xFFB8956A); // Changed from blue to warm sand
  static const Color darkEarthyOrange = Color(0xFFB87333); // Dark earthy orange for psychology
  
  // UI Elements
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFF0F0F0);
  static const Color shadow = Color(0x1A000000);
  
  // Category Colors - Earth Tones
  static const Color health = Color(0xFF9C6C5B);
  static const Color productivity = Color(0xFFD4B85A);
  static const Color mindfulness = Color(0xFF7A8471);
  static const Color exercise = Color(0xFF8B7355);
  static const Color learning = Color(0xFFA68B5B);
  static const Color social = Color(0xFF9B7B6B);
  static const Color creativity = Color(0xFFB8956A);
  static const Color selfCare = Color(0xFF7A8471);
  
  // Category Colors List for easy access
  static const List<Color> categoryColors = [
    health,
    productivity,
    mindfulness,
    exercise,
    learning,
    social,
    creativity,
    selfCare,
  ];
  
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
    colors: [success, Color(0xFF6B7562)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}