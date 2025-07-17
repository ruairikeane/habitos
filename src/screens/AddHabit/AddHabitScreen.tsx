import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { useNotifications } from '@/hooks';
import { STACKING_TEMPLATES } from '@/services/defaultData';
import { HabitFrequency } from '@/types';
import type { AddHabitScreenProps } from '@/types';

const HABIT_SUGGESTIONS = [
  { name: 'Drink Water', category: 'Health & Wellness', icon: '💧' },
  { name: 'Morning Exercise', category: 'Fitness', icon: '🏃' },
  { name: 'Read 10 Pages', category: 'Learning', icon: '📖' },
  { name: 'Meditate', category: 'Mindfulness', icon: '🧘' },
  { name: 'Write Journal', category: 'Personal Care', icon: '✍️' },
  { name: 'Take Vitamins', category: 'Health & Wellness', icon: '💊' },
  { name: 'Call Family', category: 'Social', icon: '📞' },
  { name: 'Practice Gratitude', category: 'Mindfulness', icon: '🙏' },
];

export function AddHabitScreen({ navigation }: AddHabitScreenProps) {
  const { categories, createHabit, loadCategories, isLoading } = useStore();
  const { scheduleHabitReminder, permissionGranted } = useNotifications();
  
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [frequency, setFrequency] = useState<HabitFrequency>(HabitFrequency.DAILY);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [enableReminder, setEnableReminder] = useState(false);
  const [habitStacking, setHabitStacking] = useState('');
  const [implementationIntention, setImplementationIntention] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    console.log('AddHabitScreen: Loading categories...');
    const loadData = async () => {
      try {
        await loadCategories();
        console.log('AddHabitScreen: Loaded', categories.length, 'categories');
      } catch (error) {
        console.error('AddHabitScreen: Error loading categories:', error);
      }
    };
    loadData();
  }, []);

  const handleSuggestionSelect = (suggestion: typeof HABIT_SUGGESTIONS[0]) => {
    setHabitName(suggestion.name);
    const category = categories.find(cat => cat.name === suggestion.category);
    if (category) {
      setSelectedCategory(category.id);
    }
    setShowSuggestions(false);
  };

  const handleCreateHabit = async () => {
    console.log('Creating habit:', { habitName, selectedCategory, categories: categories.length });
    
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      const newHabit = await createHabit({
        name: habitName.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        category_id: selectedCategory,
        frequency,
        color: categories.find(cat => cat.id === selectedCategory)?.color || colors.primary,
        icon: 'checkmark-circle',
        ...(habitStacking.trim() ? { habit_stacking: habitStacking.trim() } : {}),
        ...(implementationIntention.trim() ? { implementation_intention: implementationIntention.trim() } : {}),
        ...(enableReminder && reminderTime ? { reminder_time: reminderTime } : {}),
        is_active: true,
      });

      // Schedule notification if reminder is enabled and permissions granted
      if (enableReminder && permissionGranted && reminderTime && newHabit) {
        try {
          await scheduleHabitReminder({
            habitId: newHabit.id,
            habitName: habitName.trim(),
            reminderTime,
            frequency,
          });
          console.log(`Scheduled reminder for ${habitName} at ${reminderTime}`);
        } catch (notificationError) {
          console.error('Failed to schedule notification:', notificationError);
        }
      }

      Alert.alert('Success', 'Habit created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              console.log('Back button pressed, canGoBack:', navigation.canGoBack());
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Main');
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Create New Habit
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Habit Suggestions */}
        {showSuggestions && (
          <View style={styles.section}>
            <Text style={[typography.h5, styles.sectionTitle]}>
              💡 Popular Habits
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsContainer}
            >
              {HABIT_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[globalStyles.card, styles.suggestionCard]}
                  onPress={() => handleSuggestionSelect(suggestion)}
                >
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <Text style={[typography.caption, styles.suggestionName]}>
                    {suggestion.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            Habit Name *
          </Text>
          <TextInput
            style={styles.textInput}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="What habit do you want to build?"
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setShowSuggestions(false)}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            Description (Optional)
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Why is this habit important to you?"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            Category *
          </Text>
          <View style={styles.categoryGrid}>
            {categories.length === 0 ? (
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                Loading categories... ({categories.length} found)
              </Text>
            ) : null}
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[
                  styles.categoryDot,
                  { backgroundColor: category.color }
                ]} />
                <Text style={[
                  typography.bodySmall,
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            Frequency
          </Text>
          <View style={styles.frequencyContainer}>
            {Object.values(HabitFrequency).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  frequency === freq && styles.frequencyButtonSelected
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[
                  typography.bodyMedium,
                  styles.frequencyText,
                  frequency === freq && styles.frequencyTextSelected
                ]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habit Stacking */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            🔗 Habit Stacking (Optional)
          </Text>
          <Text style={[typography.caption, styles.sectionDescription]}>
            Link this habit to an existing routine for better success
          </Text>
          <TextInput
            style={styles.textInput}
            value={habitStacking}
            onChangeText={setHabitStacking}
            placeholder="After I [existing habit], I will [new habit]"
            placeholderTextColor={colors.textSecondary}
          />
          
          {/* Stacking Templates */}
          <View style={styles.templatesContainer}>
            {STACKING_TEMPLATES.slice(0, 2).map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateButton}
                onPress={() => setHabitStacking(template)}
              >
                <Text style={[typography.caption, styles.templateText]}>
                  {template}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Implementation Intention */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            📍 Implementation Intention (Optional)
          </Text>
          <Text style={[typography.caption, styles.sectionDescription]}>
            Specify when and where you'll do this habit
          </Text>
          <TextInput
            style={styles.textInput}
            value={implementationIntention}
            onChangeText={setImplementationIntention}
            placeholder="When [situation], then I will [habit]"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={[typography.h5, styles.sectionTitle]}>
            ⏰ Daily Reminder (Optional)
          </Text>
          <Text style={[typography.caption, styles.sectionDescription]}>
            Get a gentle reminder to help you stay consistent
          </Text>
          
          <View style={styles.reminderContainer}>
            <TouchableOpacity 
              style={styles.reminderToggle}
              onPress={() => setEnableReminder(!enableReminder)}
            >
              <View style={[
                styles.toggleSwitch,
                enableReminder && styles.toggleSwitchActive
              ]}>
                <View style={[
                  styles.toggleIndicator,
                  enableReminder && styles.toggleIndicatorActive
                ]} />
              </View>
              <Text style={[typography.bodyMedium, styles.reminderToggleText]}>
                Enable daily reminder
              </Text>
            </TouchableOpacity>

            {enableReminder && (
              <View style={styles.timePickerContainer}>
                <Text style={[typography.bodyMedium, styles.timeLabel]}>
                  Reminder time:
                </Text>
                <TextInput
                  style={styles.timeInput}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="09:00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            {enableReminder && !permissionGranted && (
              <View style={styles.permissionWarning}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={[typography.caption, styles.permissionWarningText]}>
                  Notification permissions not granted. Reminders may not work.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            globalStyles.buttonPrimary,
            styles.createButton,
            (!habitName.trim() || !selectedCategory || isLoading) && styles.createButtonDisabled
          ]}
          onPress={handleCreateHabit}
          disabled={!habitName.trim() || !selectedCategory || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Ionicons name="add" size={20} color={colors.surface} />
              <Text style={[globalStyles.buttonText, styles.createButtonText]}>
                Create Habit
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // Compensate for back button
  },
  headerSpacer: {
    width: 32,
  },
  section: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionDescription: {
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  suggestionCard: {
    alignItems: 'center',
    padding: spacing.sm,
    minWidth: 80,
    backgroundColor: colors.surface,
  },
  suggestionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  suggestionName: {
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
    minWidth: '45%',
  },
  categoryCardSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    flex: 1,
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    color: colors.textSecondary,
  },
  frequencyTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  templatesContainer: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  templateButton: {
    backgroundColor: colors.secondary + '15',
    borderWidth: 1,
    borderColor: colors.secondary + '30',
    borderRadius: 6,
    padding: spacing.sm,
  },
  templateText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  createButton: {
    margin: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  createButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  createButtonText: {
    marginLeft: -spacing.xs,
  },
  reminderContainer: {
    gap: spacing.md,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  reminderToggleText: {
    flex: 1,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeLabel: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warning + '15',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  permissionWarningText: {
    flex: 1,
    color: colors.warning,
  },
});