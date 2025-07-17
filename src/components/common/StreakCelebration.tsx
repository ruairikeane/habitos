import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/styles';

interface StreakCelebrationProps {
  streak: number;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export function StreakCelebration({ 
  streak, 
  isVisible, 
  onAnimationComplete 
}: StreakCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible && streak > 0) {
      // Celebratory animation for streaks
      if (streak % 7 === 0 || streak === 3 || streak === 10 || streak === 30) {
        // Special celebration for milestone streaks
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          scaleAnim.setValue(0);
          bounceAnim.setValue(0);
          onAnimationComplete?.();
        });
      }
    }
  }, [isVisible, streak]);

  if (!isVisible || streak === 0) return null;

  const isMilestone = streak % 7 === 0 || streak === 3 || streak === 10 || streak === 30;
  
  if (!isMilestone) return null;

  const getCelebrationMessage = () => {
    if (streak === 3) return "Great start! 🎉";
    if (streak === 7) return "One week strong! 🔥";
    if (streak === 10) return "Double digits! 💪";
    if (streak === 30) return "30 days! Amazing! 🏆";
    if (streak % 30 === 0) return `${streak} days! Incredible! 🌟`;
    if (streak % 7 === 0) return `${streak} days! Keep going! 🚀`;
    return `${streak} day streak! 🎯`;
  };

  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: bounceInterpolate },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.message}>{getCelebrationMessage()}</Text>
        <Text style={styles.streak}>Streak: {streak} days</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.h4,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  streak: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});