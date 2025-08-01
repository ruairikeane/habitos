import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '../../styles';
import { useStore } from '../../store';
import type { AppearanceScreenProps } from '../../types';

const THEME_OPTIONS = [
  { id: 'light', name: 'Light', icon: 'sunny', description: 'Always use light theme' },
  { id: 'dark', name: 'Dark', icon: 'moon', description: 'Always use dark theme' },
  { id: 'auto', name: 'Auto', icon: 'phone-portrait', description: 'Follow system settings' },
];

const FONT_SIZE_OPTIONS = [
  { id: 'small', name: 'Small', description: 'Compact text for more content' },
  { id: 'medium', name: 'Medium', description: 'Default readable size' },
  { id: 'large', name: 'Large', description: 'Larger text for better readability' },
];

const COLOR_SCHEME_OPTIONS = [
  { 
    id: 'earth-tones', 
    name: 'Earth Tones', 
    description: 'Calming natural colors (current)',
    colors: [colors.health, colors.learning, colors.mindfulness, colors.personalCare]
  },
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Traditional blue and gray palette',
    colors: ['#3B82F6', '#6B7280', '#10B981', '#F59E0B']
  },
  { 
    id: 'vibrant', 
    name: 'Vibrant', 
    description: 'Bold and energetic colors',
    colors: ['#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
  },
];

export function AppearanceScreen({ navigation }: AppearanceScreenProps) {
  const { settings, updateSetting, loadSettings } = useStore();
  const [previewEnabled, setPreviewEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSetting('theme', theme);
    if (previewEnabled) {
      Alert.alert(
        'Theme Updated',
        `Theme changed to ${theme}. Changes will take effect after app restart.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updateSetting('fontSize', fontSize);
    if (previewEnabled) {
      Alert.alert(
        'Font Size Updated',
        `Font size changed to ${fontSize}. Changes will take effect after app restart.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleColorSchemeChange = (colorScheme: 'earth-tones' | 'classic' | 'vibrant') => {
    updateSetting('colorScheme', colorScheme);
    if (previewEnabled) {
      Alert.alert(
        'Color Scheme Updated',
        `Color scheme changed to ${colorScheme}. Changes will take effect after app restart.`,
        [{ text: 'OK' }]
      );
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Appearance',
      'This will reset all appearance settings to their default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            updateSetting('theme', 'auto');
            updateSetting('fontSize', 'medium');
            updateSetting('colorScheme', 'earth-tones');
            Alert.alert('Settings Reset', 'Appearance settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Appearance
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Preview Toggle */}
        <View style={styles.section}>
          <View style={[globalStyles.card, styles.previewCard]}>
            <View style={styles.previewHeader}>
              <View style={styles.previewLeft}>
                <Ionicons name="eye-outline" size={24} color={colors.primary} />
                <View style={styles.previewText}>
                  <Text style={[typography.bodyMedium, styles.previewTitle]}>
                    Live Preview
                  </Text>
                  <Text style={[typography.caption, styles.previewDescription]}>
                    See changes instantly (requires restart)
                  </Text>
                </View>
              </View>
              <Switch
                value={previewEnabled}
                onValueChange={setPreviewEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={previewEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🌙 Theme
          </Text>
          
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                globalStyles.card,
                styles.optionCard,
                settings.theme === option.id && styles.optionCardActive
              ]}
              onPress={() => handleThemeChange(option.id as any)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={settings.theme === option.id ? colors.primary : colors.textSecondary} 
                  />
                  <View style={styles.optionText}>
                    <Text style={[
                      typography.bodyMedium, 
                      styles.optionTitle,
                      settings.theme === option.id && styles.optionTitleActive
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[typography.caption, styles.optionDescription]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {settings.theme === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Size Selection */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔤 Font Size
          </Text>
          
          {FONT_SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                globalStyles.card,
                styles.optionCard,
                settings.fontSize === option.id && styles.optionCardActive
              ]}
              onPress={() => handleFontSizeChange(option.id as any)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View style={styles.fontSizePreview}>
                    <Text style={[
                      styles.fontSizeExample,
                      option.id === 'small' && styles.fontSizeSmall,
                      option.id === 'medium' && styles.fontSizeMedium,
                      option.id === 'large' && styles.fontSizeLarge,
                    ]}>
                      Aa
                    </Text>
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[
                      typography.bodyMedium, 
                      styles.optionTitle,
                      settings.fontSize === option.id && styles.optionTitleActive
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[typography.caption, styles.optionDescription]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {settings.fontSize === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Scheme Selection */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🎨 Color Scheme
          </Text>
          
          {COLOR_SCHEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                globalStyles.card,
                styles.optionCard,
                settings.colorScheme === option.id && styles.optionCardActive
              ]}
              onPress={() => handleColorSchemeChange(option.id as any)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View style={styles.colorPreview}>
                    {option.colors.map((color, index) => (
                      <View
                        key={index}
                        style={[styles.colorDot, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[
                      typography.bodyMedium, 
                      styles.optionTitle,
                      settings.colorScheme === option.id && styles.optionTitleActive
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[typography.caption, styles.optionDescription]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {settings.colorScheme === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reset Button */}
        <TouchableOpacity 
          style={[globalStyles.card, styles.resetButton]}
          onPress={resetToDefaults}
        >
          <View style={styles.resetContent}>
            <Ionicons name="refresh-outline" size={24} color={colors.error} />
            <Text style={[typography.bodyMedium, styles.resetText]}>
              Reset to Defaults
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  previewCard: {
    marginBottom: spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  previewText: {
    flex: 1,
    gap: spacing.xs,
  },
  previewTitle: {
    color: colors.textPrimary,
  },
  previewDescription: {
    color: colors.textSecondary,
  },
  optionCard: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  optionTitle: {
    color: colors.textPrimary,
  },
  optionTitleActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    color: colors.textSecondary,
  },
  fontSizePreview: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  fontSizeExample: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  fontSizeSmall: {
    fontSize: 14,
  },
  fontSizeMedium: {
    fontSize: 18,
  },
  fontSizeLarge: {
    fontSize: 22,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  resetText: {
    color: colors.error,
    fontWeight: '600',
  },
});