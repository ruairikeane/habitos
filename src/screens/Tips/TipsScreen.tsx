import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { EXTENDED_HABIT_TIPS, STACKING_TEMPLATES } from '@/services/defaultData';
import { useScrollToTop } from '@/navigation/TabNavigator';
import { useStore } from '@/store';
import type { TipsScreenProps } from '@/types';

export function TipsScreen({ navigation }: TipsScreenProps) {
  const [activeSection, setActiveSection] = useState<'tips' | 'stacking' | 'suggested'>('tips');
  const { habits, categories, isLoading, loadHabits, loadCategories } = useStore();
  
  // Scroll to top ref
  const scrollViewRef = useRef<ScrollView>(null);

  // Load user data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadHabits();
      await loadCategories();
    };
    loadData();
  }, []);

  // Register scroll function for tab navigation
  useScrollToTop('Tips', () => {
    console.log('🔝 TipsScreen: Scrolling to top');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  });

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

  // Intelligent habit suggestion logic
  const getSuggestedHabits = () => {
    if (!habits || habits.length === 0) {
      // New user - suggest foundational habits
      return [
        { name: "Drink a glass of water when you wake up", category: "Health & Wellness", reason: "Start your day with hydration", icon: "water", color: colors.health },
        { name: "Make your bed every morning", category: "Productivity", reason: "Begin each day with a small win", icon: "bed", color: colors.productivity },
        { name: "Read 5 pages before bed", category: "Learning", reason: "Build a learning habit", icon: "book", color: colors.learning },
        { name: "Take 3 deep breaths before meals", category: "Mindfulness", reason: "Practice mindful eating", icon: "leaf", color: colors.mindfulness },
      ];
    }

    const suggestions = [];
    const userCategories = new Set(habits.map(h => h.category.name.toLowerCase()));
    const categoryCounts = {};
    
    // Count habits per category
    habits.forEach(habit => {
      const cat = habit.category.name;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Suggest complementary habits based on existing patterns
    if (userCategories.has('health & wellness') || userCategories.has('health')) {
      if (!habits.some(h => h.name.toLowerCase().includes('walk'))) {
        suggestions.push({ 
          name: "Take a 10-minute walk after lunch", 
          category: "Health & Wellness", 
          reason: "Complement your health habits with movement", 
          icon: "walk", 
          color: colors.health 
        });
      }
    }

    if (userCategories.has('productivity')) {
      if (!habits.some(h => h.name.toLowerCase().includes('plan') || h.name.toLowerCase().includes('schedule'))) {
        suggestions.push({ 
          name: "Plan tomorrow's top 3 tasks before bed", 
          category: "Productivity", 
          reason: "Stack with your productivity habits", 
          icon: "list", 
          color: colors.productivity 
        });
      }
    }

    if (userCategories.has('learning')) {
      if (!habits.some(h => h.name.toLowerCase().includes('podcast') || h.name.toLowerCase().includes('listen'))) {
        suggestions.push({ 
          name: "Listen to a 15-minute educational podcast", 
          category: "Learning", 
          reason: "Expand your learning habits", 
          icon: "headset", 
          color: colors.learning 
        });
      }
    }

    if (userCategories.has('fitness')) {
      if (!habits.some(h => h.name.toLowerCase().includes('stretch'))) {
        suggestions.push({ 
          name: "Do 5 minutes of stretching before bed", 
          category: "Fitness", 
          reason: "Perfect cooldown for your fitness routine", 
          icon: "body", 
          color: colors.fitness 
        });
      }
    }

    // Suggest missing foundational categories
    if (!userCategories.has('mindfulness')) {
      suggestions.push({ 
        name: "Practice 5 minutes of deep breathing", 
        category: "Mindfulness", 
        reason: "Add mindfulness to balance your routine", 
        icon: "leaf", 
        color: colors.mindfulness 
      });
    }

    if (!userCategories.has('personal care')) {
      suggestions.push({ 
        name: "Apply moisturizer after your evening routine", 
        category: "Personal Care", 
        reason: "Self-care enhances all other habits", 
        icon: "heart", 
        color: colors.personalCare 
      });
    }

    // Advanced stacking suggestions based on existing habits
    habits.forEach(habit => {
      const name = habit.name.toLowerCase();
      if (name.includes('coffee') || name.includes('breakfast')) {
        if (!habits.some(h => h.name.toLowerCase().includes('gratitude'))) {
          suggestions.push({ 
            name: "Write one thing you're grateful for with morning coffee", 
            category: "Mindfulness", 
            reason: `Perfect to stack with "${habit.name}"`, 
            icon: "heart", 
            color: colors.mindfulness 
          });
        }
      }
      
      if (name.includes('shower') || name.includes('bath')) {
        if (!habits.some(h => h.name.toLowerCase().includes('intention'))) {
          suggestions.push({ 
            name: "Set a daily intention while showering", 
            category: "Mindfulness", 
            reason: `Use shower time from "${habit.name}" for reflection`, 
            icon: "bulb", 
            color: colors.mindfulness 
          });
        }
      }
    });

    return suggestions.slice(0, 6); // Return top 6 suggestions
  };

  const renderSuggested = () => {
    const suggestions = getSuggestedHabits();
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodySmall, styles.loadingText]}>
            Analyzing your habits...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tipsContainer}>
        <View style={[globalStyles.card, styles.infoCard]}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            🎯 Personalized for You
          </Text>
          <Text style={[typography.body, styles.sectionContent]}>
            {habits.length === 0 
              ? "Start your habit journey with these foundational habits that build momentum."
              : `Based on your ${habits.length} existing habits, here are intelligent suggestions to enhance your routine.`
            }
          </Text>
        </View>

        <Text style={[typography.h4, styles.templatesHeader]}>
          Suggested Habits:
        </Text>

        {suggestions.map((suggestion, index) => {
          return (
            <TouchableOpacity 
              key={index} 
              style={[
                globalStyles.card, 
                styles.suggestionCard,
                { 
                  backgroundColor: suggestion.color + '10',
                  borderLeftColor: suggestion.color,
                }
              ]}
              onPress={() => navigation.navigate('AddHabit', { 
                suggestedName: suggestion.name,
                suggestedCategory: suggestion.category 
              })}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionTitleRow}>
                  <Ionicons 
                    name={suggestion.icon as any} 
                    size={20} 
                    color={suggestion.color} 
                    style={styles.suggestionIcon}
                  />
                  <Text style={[typography.bodyMedium, styles.suggestionName]}>
                    {suggestion.name}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </View>
              
              <Text style={[typography.caption, styles.suggestionCategory]}>
                {suggestion.category}
              </Text>
              
              <Text style={[typography.bodySmall, styles.suggestionReason]}>
                💡 {suggestion.reason}
              </Text>
            </TouchableOpacity>
          );
        })}

        {habits.length > 0 && (
          <View style={[globalStyles.card, styles.analysisCard]}>
            <Text style={[typography.h5, styles.analysisTitle]}>
              📊 Your Habit Analysis
            </Text>
            <Text style={[typography.body, styles.analysisText]}>
              You have habits in {new Set(habits.map(h => h.category.name)).size} different categories. 
              {habits.length >= 5 
                ? " You're building a well-rounded routine! Consider habit stacking to maximize consistency."
                : " Consider adding habits in new categories for a more balanced lifestyle."
              }
            </Text>
          </View>
        )}
      </View>
    );
  };

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
          style={[styles.tab, activeSection === 'suggested' && styles.activeTab]}
          onPress={() => setActiveSection('suggested')}
        >
          <Text style={[
            styles.tabText,
            activeSection === 'suggested' && styles.activeTabText
          ]}>
            Suggested
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {activeSection === 'tips' && renderTips()}
        {activeSection === 'stacking' && renderStacking()}
        {activeSection === 'suggested' && renderSuggested()}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestionCard: {
    borderLeftWidth: 4,
    // borderLeftColor is set dynamically
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionName: {
    flex: 1,
    color: colors.textPrimary,
  },
  suggestionCategory: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  suggestionReason: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  analysisCard: {
    marginTop: spacing.md,
    backgroundColor: colors.secondary + '10',
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  analysisTitle: {
    marginBottom: spacing.sm,
    color: colors.secondary,
  },
  analysisText: {
    lineHeight: 22,
    color: colors.textPrimary,
  },
});