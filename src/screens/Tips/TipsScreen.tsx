import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { EXTENDED_HABIT_TIPS, STACKING_TEMPLATES } from '@/services/defaultData';
import { useScrollToTop } from '@/navigation/TabNavigator';
import { useStore } from '@/store';
import { geminiService, type HabitSuggestion, type AIAnalysis } from '@/services/ai/geminiService';
import type { TipsScreenProps } from '@/types';

export function TipsScreen({ navigation }: TipsScreenProps) {
  const [activeSection, setActiveSection] = useState<'tips' | 'stacking' | 'suggested'>('tips');
  const { habits, categories, isLoading, loadHabits, loadCategories } = useStore();
  
  // AI-powered suggestions state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
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

  // Generate AI suggestions when habits change
  useEffect(() => {
    if (habits.length >= 0 && activeSection === 'suggested') {
      generateAISuggestions();
    }
  }, [habits, activeSection]);

  const generateAISuggestions = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    
    try {
      console.log('🤖 Generating AI suggestions for', habits.length, 'habits...');
      const analysis = await geminiService.generateHabitSuggestions(habits, {
        challengeLevel: 'moderate',
        timeAvailable: 30, // Could be user preference
      });
      
      setAiAnalysis(analysis);
      console.log('🤖 AI Analysis complete:', analysis.suggestions.length, 'suggestions');
    } catch (error) {
      console.error('🤖 AI suggestion error:', error);
      setAiError('AI suggestions temporarily unavailable');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const refreshAISuggestions = () => {
    generateAISuggestions();
  };


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
    // Show loading state for AI analysis
    if (isLoadingAI || isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodySmall, styles.loadingText]}>
            🤖 AI is analyzing your habits...
          </Text>
          <Text style={[typography.caption, styles.loadingSubtext]}>
            Generating personalized suggestions
          </Text>
        </View>
      );
    }

    // Use AI suggestions if available, fallback to hardcoded
    const suggestions = aiAnalysis?.suggestions || getSuggestedHabits();
    const insights = aiAnalysis?.insights || [];
    const recommendations = aiAnalysis?.recommendations || [];

    return (
      <View style={styles.tipsContainer}>
        {/* AI Header */}
        <View style={[globalStyles.card, styles.aiHeaderCard]}>
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiHeaderContent}>
              <Text style={[typography.h5, styles.aiTitle]}>
                🤖 AI-Powered Suggestions
              </Text>
              <Text style={[typography.body, styles.aiSubtitle]}>
                {habits.length === 0 
                  ? "AI recommends these foundational habits to start your journey."
                  : `Based on your ${habits.length} habits, AI suggests these next steps.`
                }
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshAISuggestions}
              disabled={isLoadingAI}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={colors.primary} 
                style={{ opacity: isLoadingAI ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Error State */}
        {aiError && (
          <View style={[globalStyles.card, styles.errorCard]}>
            <Text style={[typography.bodySmall, styles.errorText]}>
              {aiError}. Using smart fallback suggestions.
            </Text>
          </View>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <View style={[globalStyles.card, styles.insightsCard]}>
            <Text style={[typography.h5, styles.insightsTitle]}>
              💡 AI Insights
            </Text>
            {insights.map((insight, index) => (
              <Text key={index} style={[typography.bodySmall, styles.insightText]}>
                • {insight}
              </Text>
            ))}
          </View>
        )}

        <Text style={[typography.h4, styles.templatesHeader]}>
          Suggested Habits:
        </Text>

        {suggestions.map((suggestion, index) => {
          // Handle both AI and fallback suggestion formats
          const isAISuggestion = 'reasoning' in suggestion;
          const categoryColor = getCategoryColor(suggestion.category);
          
          return (
            <TouchableOpacity 
              key={index} 
              style={[
                globalStyles.card, 
                styles.suggestionCard,
                { 
                  backgroundColor: categoryColor + '10',
                  borderLeftColor: categoryColor,
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
                    name={getCategoryIcon(suggestion.category)} 
                    size={20} 
                    color={categoryColor} 
                    style={styles.suggestionIcon}
                  />
                  <Text style={[typography.bodyMedium, styles.suggestionName]}>
                    {suggestion.name}
                  </Text>
                </View>
                <View style={styles.suggestionMeta}>
                  {isAISuggestion && suggestion.estimatedMinutes && (
                    <Text style={[typography.caption, styles.timeText]}>
                      {suggestion.estimatedMinutes}min
                    </Text>
                  )}
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </View>
              </View>
              
              <Text style={[typography.caption, styles.suggestionCategory]}>
                {suggestion.category}
                {isAISuggestion && suggestion.difficulty && (
                  <Text style={styles.difficultyBadge}>
                    {' '}• {suggestion.difficulty}
                  </Text>
                )}
              </Text>
              
              <Text style={[typography.bodySmall, styles.suggestionReason]}>
                🧠 {isAISuggestion ? suggestion.reasoning : suggestion.reason}
              </Text>

              {isAISuggestion && suggestion.stackingOpportunity && (
                <Text style={[typography.bodySmall, styles.stackingText]}>
                  🔗 {suggestion.stackingOpportunity}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <View style={[globalStyles.card, styles.recommendationsCard]}>
            <Text style={[typography.h5, styles.recommendationsTitle]}>
              🎯 Strategic Recommendations
            </Text>
            {recommendations.map((rec, index) => (
              <Text key={index} style={[typography.bodySmall, styles.recommendationText]}>
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Helper functions for category colors and icons
  const getCategoryColor = (categoryName: string): string => {
    const colorMap: Record<string, string> = {
      'Health & Wellness': colors.health,
      'Health': colors.health,
      'Productivity': colors.productivity,
      'Learning': colors.learning,
      'Mindfulness': colors.mindfulness,
      'Personal Care': colors.personalCare,
      'Social': colors.social,
      'Creative': colors.creative,
      'Fitness': colors.fitness,
    };
    return colorMap[categoryName] || colors.primary;
  };

  const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Health & Wellness': 'heart',
      'Health': 'heart',
      'Productivity': 'checkmark-circle',
      'Learning': 'book',
      'Mindfulness': 'leaf',
      'Personal Care': 'person',
      'Social': 'people',
      'Creative': 'color-palette',
      'Fitness': 'fitness',
    };
    return iconMap[categoryName] || 'star';
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
  // AI-specific styles
  aiHeaderCard: {
    backgroundColor: colors.primary + '08',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiHeaderContent: {
    flex: 1,
  },
  aiTitle: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  aiSubtitle: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  errorCard: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: colors.learning + '08',
    borderWidth: 1,
    borderColor: colors.learning + '20',
  },
  insightsTitle: {
    color: colors.learning,
    marginBottom: spacing.sm,
  },
  insightText: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  loadingSubtext: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeText: {
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
  },
  difficultyBadge: {
    color: colors.textTertiary,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  stackingText: {
    color: colors.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: spacing.xs,
    backgroundColor: colors.secondary + '10',
    padding: spacing.xs,
    borderRadius: 4,
  },
  recommendationsCard: {
    backgroundColor: colors.success + '08',
    borderWidth: 1,
    borderColor: colors.success + '20',
    marginTop: spacing.md,
  },
  recommendationsTitle: {
    color: colors.success,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});