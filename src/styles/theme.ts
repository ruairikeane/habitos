// Theme configuration with earth-tone color palette and Inter font typography

import { TextStyle } from 'react-native';

// Earth-tone color palette
export const colors = {
  // Base Colors
  background: '#F8F6F3',      // Warm off-white
  surface: '#FFFFFF',         // Pure white for cards
  textPrimary: '#2D2A26',     // Warm dark brown
  textSecondary: '#6B6560',   // Muted brown-gray
  textTertiary: '#A8A09A',    // Light brown-gray
  border: '#E8E4E0',          // Soft beige
  divider: '#F0EDEA',         // Very light beige

  // Accent Colors
  primary: '#8B7355',         // Warm taupe (main buttons)
  primaryLight: '#A49084',    // Light taupe
  primaryDark: '#726049',     // Dark taupe
  secondary: '#A4956B',       // Sage olive (secondary actions)
  secondaryLight: '#BFB389',  // Light sage olive
  secondaryDark: '#8A7D56',   // Dark sage olive

  // Status Colors
  success: '#7A8471',         // Muted sage green (completed habits)
  successLight: '#96A089',    // Light sage green
  successDark: '#65715A',     // Dark sage green
  warning: '#B8956A',         // Dusty gold (reminders, alerts)
  warningLight: '#CCAD84',    // Light dusty gold
  warningDark: '#9A7D57',     // Dark dusty gold
  error: '#A67C7C',           // Dusty rose (validation errors)
  errorLight: '#C29999',      // Light dusty rose
  errorDark: '#8A6666',       // Dark dusty rose
  info: '#8FA4B2',            // Dusty blue
  infoLight: '#A8B8C4',       // Light dusty blue
  infoDark: '#7A8E9A',        // Dark dusty blue

  // Category Colors
  health: '#9CAF88',          // Soft sage
  healthLight: '#B8C7A8',     // Pale sage
  healthDark: '#7A8471',      // Deep sage
  
  productivity: '#A4956B',    // Warm olive
  productivityLight: '#BFB389', // Light olive
  productivityDark: '#8A7D56', // Deep olive
  
  personalCare: '#C4A484',    // Dusty peach
  personalCareLight: '#D4B89E', // Pale peach
  personalCareDark: '#A68A6E', // Warm tan
  
  learning: '#8FA4B2',        // Dusty blue
  learningLight: '#A8B8C4',   // Pale blue-gray
  learningDark: '#7A8E9A',    // Deeper blue-gray
  
  fitness: '#A67C7C',         // Dusty rose
  fitnessLight: '#C29999',    // Pale rose
  fitnessDark: '#8A6666',     // Deep rose
  
  mindfulness: '#9B8BA4',     // Soft lavender-gray
  mindfulnessLight: '#B5A8BC', // Pale lavender
  mindfulnessDark: '#827389', // Deep lavender-gray
  
  social: '#B8956A',          // Warm sand
  socialLight: '#CCAD84',     // Pale sand
  socialDark: '#9A7D57',      // Deep sand
  
  creative: '#A49B8B',        // Mushroom
  creativeLight: '#B8B0A5',   // Pale mushroom
  creativeDark: '#8A8175',    // Deep mushroom

  // Progress Indicators
  progressEmpty: '#E8E4E0',   // Light beige
  progressPartial: '#C4A484', // Dusty peach
  progressComplete: '#7A8471', // Muted sage green
  streakFire: '#B8956A',      // Warm gold

  // Interactive States
  buttonPrimary: '#8B7355',   // Warm taupe
  buttonSecondary: '#A4956B', // Sage olive
  buttonDisabled: '#CCC5BE',  // Disabled state
  linkColor: '#8FA4B2',       // Dusty blue
  focus: '#B8956A',           // Warm gold (focus/selection)
  
  // Status Indicators
  activeHabit: '#8B7355',     // Warm taupe
  pausedHabit: '#9B8BA4',     // Soft lavender
  archivedHabit: '#6B6560',   // Muted gray
  newHabit: '#9CAF88',        // Soft sage

  // Dark Mode Colors (for future implementation)
  dark: {
    background: '#1A1816',     // Warm dark
    surface: '#2D2A26',       // Dark brown
    textPrimary: '#F8F6F3',   // Warm off-white
    textSecondary: '#B8B0A5', // Muted beige
    border: '#3D3A36',        // Dark border
  }
};

// Typography system with system fonts (Inter can be added later)
interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  bodySmallMedium: TextStyle;
  button: TextStyle;
  buttonSmall: TextStyle;
  caption: TextStyle;
  captionMedium: TextStyle;
  tabLabel: TextStyle;
  progressNumber: TextStyle;
  streakNumber: TextStyle;
  overline: TextStyle;
}

export const typography: Typography = {
  // Display styles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.25,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  h5: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  h6: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },

  // Body styles
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  bodySmallMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textPrimary,
  },

  // UI element styles
  button: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  
  // Tab and navigation styles
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  
  // Number and progress styles
  progressNumber: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.primary,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.streakFire,
  }
};

// Spacing system (8pt grid)
export const spacing = {
  xs: 4,   // Small gaps, icon padding
  sm: 8,   // Component spacing, small margins  
  md: 16,  // Card padding, standard margins
  lg: 24,  // Section spacing, large margins
  xl: 32,  // Screen margins, major sections
  xxl: 48, // Large sections, screen padding
};

// Border radius system
export const borderRadius = {
  xs: 4,   // Small elements
  sm: 8,   // Buttons, input fields
  md: 12,  // Cards, main components
  lg: 16,  // Large cards, modals
  xl: 24,  // Major containers
  full: 999, // Fully rounded (pills, circles)
};

// Shadow system
export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.2,
    elevation: 8,
  },
};

// Complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;