import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../styles';

interface AnimatedCheckboxProps {
  isCompleted: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}

export function AnimatedCheckbox({ 
  isCompleted, 
  color, 
  onToggle, 
  size = 24 
}: AnimatedCheckboxProps) {
  
  // DEBUG: Log every render with prop values
  console.log('🔴 AnimatedCheckbox render:', { isCompleted, color });

  const handlePress = (event: any) => {
    event.stopPropagation();
    console.log('🔴 AnimatedCheckbox: Button pressed, current state:', isCompleted);
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: isCompleted ? color : 'transparent',
          },
        ]}
      >
        {isCompleted && (
          <Text style={[styles.checkmark, { fontSize: size * 0.5 }]}>
            ✓
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

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