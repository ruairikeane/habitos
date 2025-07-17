import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { EXTENDED_HABIT_TIPS, STACKING_TEMPLATES } from '@/services/defaultData';
import type { TipsScreenProps } from '@/types';

export function TipsScreen({ navigation }: TipsScreenProps) {
  const [activeSection, setActiveSection] = useState<'tips' | 'stacking' | 'science'>('tips');

  // Define earth-tone colors for each tip
  const tipColors = [
    colors.health,        // Soft sage
    colors.learning,      // Dusty blue
    colors.mindfulness,   // Soft lavender-gray
    colors.personalCare,  // Dusty peach
    colors.social,        // Warm sand
    colors.creative,      // Mushroom
  ];

  const renderTips = () => (
    <View style={styles.tipsContainer}>
      {EXTENDED_HABIT_TIPS.map((tip, index) => {
        const tipColor = tipColors[index % tipColors.length];
        return (
          <View 
            key={index} 
            style={[
              globalStyles.card, 
              styles.tipCard,
              { 
                borderLeftColor: tipColor,
                backgroundColor: tipColor + '08' // Very light background tint
              }
            ]}
          >
            <Text style={[typography.h5, styles.tipTitle, { color: tipColor }]}>
              {tip.title}
            </Text>
            <Text style={[typography.body, styles.tipContent]}>
              {tip.content}
            </Text>
            {tip.category && (
              <Text style={[typography.caption, styles.tipCategory]}>
                {tip.category.charAt(0).toUpperCase() + tip.category.slice(1).replace('-', ' ')}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderStacking = () => (
    <View style={styles.tipsContainer}>
      <View style={[globalStyles.card, styles.infoCard]}>
        <Text style={[typography.h5, styles.sectionTitle]}>
          🔗 What is Habit Stacking?
        </Text>
        <Text style={[typography.body, styles.sectionContent]}>
          Habit stacking is a strategy to pair a new habit with an existing habit. The existing habit serves as a cue for the new habit.
        </Text>
      </View>

      <Text style={[typography.h4, styles.templatesHeader]}>
        Templates to Try:
      </Text>

      {STACKING_TEMPLATES.map((template, index) => {
        const templateColor = tipColors[(index + 2) % tipColors.length]; // Offset to avoid same colors as tips
        return (
          <View 
            key={index} 
            style={[
              globalStyles.card, 
              styles.templateCard,
              { 
                backgroundColor: templateColor + '10',
                borderColor: templateColor + '30'
              }
            ]}
          >
            <Text style={[typography.bodyMedium, styles.templateText]}>
              {template}
            </Text>
          </View>
        );
      })}

      <View style={[globalStyles.card, styles.exampleCard]}>
        <Text style={[typography.h5, styles.exampleTitle]}>
          💡 Real Examples:
        </Text>
        <View style={styles.exampleList}>
          <Text style={[typography.body, styles.exampleItem]}>
            • After I pour my morning coffee, I will write 3 gratitudes
          </Text>
          <Text style={[typography.body, styles.exampleItem]}>
            • After I sit down for dinner, I will put my phone in another room
          </Text>
          <Text style={[typography.body, styles.exampleItem]}>
            • After I close my laptop, I will do 10 pushups
          </Text>
        </View>
      </View>

      {/* Add Habit with Stacking Button */}
      <TouchableOpacity 
        style={[globalStyles.buttonPrimary, styles.addHabitButton]}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Text style={[globalStyles.buttonText, styles.addHabitButtonText]}>
          ➕ Try Habit Stacking
        </Text>
        <Text style={[typography.caption, styles.addHabitSubtext]}>
          Create a new habit using the templates above
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderScience = () => (
    <View style={styles.tipsContainer}>
      <View style={[globalStyles.card, styles.scienceCard]}>
        <Text style={[typography.h4, styles.scienceTitle]}>
          🧠 The Science of Habits
        </Text>
        
        <View style={styles.scienceSection}>
          <Text style={[typography.h5, styles.scienceSubtitle]}>
            The 66-Day Reality
          </Text>
          <Text style={[typography.body, styles.scienceText]}>
            Research shows it takes an average of 66 days (not 21!) to form a habit. The range is 18-254 days depending on complexity.
          </Text>
        </View>

        <View style={styles.scienceSection}>
          <Text style={[typography.h5, styles.scienceSubtitle]}>
            The Habit Loop
          </Text>
          <Text style={[typography.body, styles.scienceText]}>
            Every habit follows: Cue → Routine → Reward. Understanding this loop helps you design better habits.
          </Text>
        </View>

        <View style={styles.scienceSection}>
          <Text style={[typography.h5, styles.scienceSubtitle]}>
            1% Better Daily
          </Text>
          <Text style={[typography.body, styles.scienceText]}>
            Improving just 1% each day leads to 37x better results over a year through compound growth.
          </Text>
        </View>

        <View style={styles.scienceSection}>
          <Text style={[typography.h5, styles.scienceSubtitle]}>
            Environment Design
          </Text>
          <Text style={[typography.body, styles.scienceText]}>
            Make good habits obvious and bad habits invisible by changing your environment rather than relying on willpower.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container} edges={['left', 'right']}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'tips' && styles.activeTab]}
          onPress={() => setActiveSection('tips')}
        >
          <Text style={[
            styles.tabText,
            activeSection === 'tips' && styles.activeTabText
          ]}>
            Daily Tips
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeSection === 'stacking' && styles.activeTab]}
          onPress={() => setActiveSection('stacking')}
        >
          <Text style={[
            styles.tabText,
            activeSection === 'stacking' && styles.activeTabText
          ]}>
            Habit Stacking
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeSection === 'science' && styles.activeTab]}
          onPress={() => setActiveSection('science')}
        >
          <Text style={[
            styles.tabText,
            activeSection === 'science' && styles.activeTabText
          ]}>
            Science
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {activeSection === 'tips' && renderTips()}
        {activeSection === 'stacking' && renderStacking()}
        {activeSection === 'science' && renderScience()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: spacing.md,
  },
  tipCard: {
    borderLeftWidth: 4,
    // borderLeftColor is now set dynamically
  },
  tipTitle: {
    marginBottom: spacing.sm,
    // color is now set dynamically
  },
  tipContent: {
    lineHeight: 22,
  },
  tipCategory: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  sectionContent: {
    lineHeight: 22,
  },
  templatesHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  templateCard: {
    borderWidth: 1,
    // backgroundColor and borderColor are now set dynamically
  },
  templateText: {
    fontStyle: 'italic',
    color: colors.textPrimary,
  },
  exampleCard: {
    marginTop: spacing.sm,
  },
  exampleTitle: {
    marginBottom: spacing.sm,
    color: colors.success,
  },
  exampleList: {
    gap: spacing.xs,
  },
  exampleItem: {
    lineHeight: 20,
  },
  scienceCard: {
    gap: spacing.lg,
  },
  scienceTitle: {
    textAlign: 'center',
    color: colors.primary,
  },
  scienceSection: {
    gap: spacing.sm,
  },
  scienceSubtitle: {
    color: colors.secondary,
  },
  scienceText: {
    lineHeight: 22,
  },
  addHabitButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  addHabitButtonText: {
    marginBottom: spacing.xs,
  },
  addHabitSubtext: {
    color: colors.surface,
    opacity: 0.8,
    textAlign: 'center',
  },
});