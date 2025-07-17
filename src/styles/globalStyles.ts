// Global styles and common styling patterns

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from './theme';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerNoTopSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 12, // spacing.sm + spacing.xs (8px + 4px = 12px)
    paddingBottom: spacing.xxl,
  },
  screenPadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardCompact: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.surface,
  },
  buttonTextOutline: {
    ...typography.button,
    color: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
  },
  inputFocused: {
    borderColor: colors.focus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  
  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: '600',
  },
  textMuted: {
    color: colors.textSecondary,
  },
  textError: {
    color: colors.error,
  },
  textSuccess: {
    color: colors.success,
  },
  textPrimary: {
    color: colors.primary,
  },
  
  // Progress styles
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.progressEmpty,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.progressComplete,
    borderRadius: borderRadius.full,
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.progressEmpty,
  },
  
  // List styles
  listContainer: {
    paddingVertical: spacing.sm,
  },
  listItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.lg,
  },
  
  // Separator styles
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  separatorThick: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  
  // Badge styles
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  
  // Icon styles
  iconSmall: {
    width: 16,
    height: 16,
  },
  iconMedium: {
    width: 24,
    height: 24,
  },
  iconLarge: {
    width: 32,
    height: 32,
  },
  
  // Spacing utilities
  marginTopXs: { marginTop: spacing.xs },
  marginTopSm: { marginTop: spacing.sm },
  marginTopMd: { marginTop: spacing.md },
  marginTopLg: { marginTop: spacing.lg },
  marginTopXl: { marginTop: spacing.xl },
  
  marginBottomXs: { marginBottom: spacing.xs },
  marginBottomSm: { marginBottom: spacing.sm },
  marginBottomMd: { marginBottom: spacing.md },
  marginBottomLg: { marginBottom: spacing.lg },
  marginBottomXl: { marginBottom: spacing.xl },
  
  marginHorizontalXs: { marginHorizontal: spacing.xs },
  marginHorizontalSm: { marginHorizontal: spacing.sm },
  marginHorizontalMd: { marginHorizontal: spacing.md },
  marginHorizontalLg: { marginHorizontal: spacing.lg },
  marginHorizontalXl: { marginHorizontal: spacing.xl },
  
  paddingTopXs: { paddingTop: spacing.xs },
  paddingTopSm: { paddingTop: spacing.sm },
  paddingTopMd: { paddingTop: spacing.md },
  paddingTopLg: { paddingTop: spacing.lg },
  paddingTopXl: { paddingTop: spacing.xl },
  
  paddingBottomXs: { paddingBottom: spacing.xs },
  paddingBottomSm: { paddingBottom: spacing.sm },
  paddingBottomMd: { paddingBottom: spacing.md },
  paddingBottomLg: { paddingBottom: spacing.lg },
  paddingBottomXl: { paddingBottom: spacing.xl },
  
  paddingHorizontalXs: { paddingHorizontal: spacing.xs },
  paddingHorizontalSm: { paddingHorizontal: spacing.sm },
  paddingHorizontalMd: { paddingHorizontal: spacing.md },
  paddingHorizontalLg: { paddingHorizontal: spacing.lg },
  paddingHorizontalXl: { paddingHorizontal: spacing.xl },
});

// Category color helpers
export const getCategoryColor = (categoryName: string): string => {
  const categoryColors: Record<string, string> = {
    health: colors.health,
    productivity: colors.productivity,
    personalCare: colors.personalCare,
    learning: colors.learning,
    fitness: colors.fitness,
    mindfulness: colors.mindfulness,
    social: colors.social,
    creative: colors.creative,
  };
  
  return categoryColors[categoryName.toLowerCase()] || colors.primary;
};

// Progress color helpers
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 0.8) return colors.success;
  if (percentage >= 0.6) return colors.warning;
  if (percentage >= 0.4) return colors.info;
  return colors.error;
};