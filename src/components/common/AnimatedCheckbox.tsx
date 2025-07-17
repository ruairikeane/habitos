import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/styles';

interface AnimatedCheckboxProps {
  isCompleted: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}

export const AnimatedCheckbox = React.memo(function AnimatedCheckbox({ 
  isCompleted, 
  color, 
  onToggle, 
  size = 24 
}: AnimatedCheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    if (isCompleted) {
      // Success animation: scale up briefly then back down
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade in checkmark
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Fade out checkmark
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Light haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isCompleted]);

  const handlePress = useCallback((event: any) => {
    event.stopPropagation();
    onToggle();
  }, [onToggle]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: isCompleted ? color : 'transparent',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.checkmark, { fontSize: size * 0.5 }]}>
            ✓
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    fontWeight: '600',
    color: colors.surface,
  },
});