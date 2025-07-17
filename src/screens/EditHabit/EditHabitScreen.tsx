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
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useStore } from '@/store';
import { useNotifications } from '@/hooks';
import { HabitFrequency } from '@/types';
import type { EditHabitScreenProps } from '@/types';

export function EditHabitScreen({ route, navigation }: EditHabitScreenProps) {
  const { habitId } = route.params;
  const { habits, categories, updateHabit, deleteHabit, loadCategories, isLoading } = useStore();
  const { scheduleHabitReminder, cancelHabitNotifications, permissionGranted } = useNotifications();
  
  const habit = habits.find(h => h.id === habitId);
  
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [frequency, setFrequency] = useState<HabitFrequency>(HabitFrequency.DAILY);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [enableReminder, setEnableReminder] = useState(false);
  const [habitStacking, setHabitStacking] = useState('');
  const [implementationIntention, setImplementationIntention] = useState('');

  useEffect(() => {
    loadCategories();
    
    // Populate form with existing habit data
    if (habit) {
      setHabitName(habit.name);
      setDescription(habit.description || '');
      setSelectedCategory(habit.category_id);
      setFrequency(habit.frequency);
      setReminderTime(habit.reminder_time || '09:00');
      setEnableReminder(!!habit.reminder_time);
      setHabitStacking(habit.habit_stacking || '');
      setImplementationIntention(habit.implementation_intention || '');
    }
  }, [habit]);

  const handleSave = async () => {
    if (!habit) return;
    
    if (!habitName.trim()) {
      Alert.alert('Validation Error', 'Please enter a habit name.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }

    try {
      const habitData = {
        name: habitName.trim(),
        description: description.trim(),
        category_id: selectedCategory,
        frequency,
        reminder_time: enableReminder ? reminderTime : undefined,
        habit_stacking: habitStacking.trim() || undefined,
        implementation_intention: implementationIntention.trim() || undefined,
      };

      await updateHabit(habitId, habitData);

      // Handle notification scheduling
      if (enableReminder && permissionGranted) {
        await scheduleHabitReminder({
          habitId,
          habitName: habitName,
          reminderTime: reminderTime,
          frequency: frequency,
        });
      } else if (!enableReminder) {
        await cancelHabitNotifications(habitId);
      }

      Alert.alert('Success', 'Habit updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              await cancelHabitNotifications(habitId);
              Alert.alert('Success', 'Habit deleted successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Main') }
              ]);
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!habit) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={typography.h4}>Habit not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[typography.h3, styles.title]}>Edit Habit</Text>
        </View>

        {/* Habit Name */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Habit Name</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="Enter habit name..."
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What does this habit help you achieve?"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Category Selection */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  selectedCategory === category.id && styles.categoryOptionSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Frequency */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {Object.values(HabitFrequency).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyOption,
                  frequency === freq && styles.frequencyOptionSelected
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[
                  styles.frequencyText,
                  frequency === freq && styles.frequencyTextSelected
                ]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder */}
        <View style={[globalStyles.card, styles.section]}>
          <View style={styles.reminderHeader}>
            <Text style={[typography.h4, styles.sectionTitle]}>Reminder</Text>
            <TouchableOpacity
              style={[styles.toggle, enableReminder && styles.toggleActive]}
              onPress={() => setEnableReminder(!enableReminder)}
            >
              <View style={[styles.toggleKnob, enableReminder && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>
          {enableReminder && (
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Time:</Text>
              <TextInput
                style={styles.timeTextInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                maxLength={5}
              />
            </View>
          )}
        </View>

        {/* Advanced Features */}
        <View style={[globalStyles.card, styles.section]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Advanced Features</Text>
          
          <Text style={styles.inputLabel}>Habit Stacking (Optional)</Text>
          <TextInput
            style={styles.input}
            value={habitStacking}
            onChangeText={setHabitStacking}
            placeholder="After I [existing habit], I will [new habit]"
            maxLength={100}
          />

          <Text style={styles.inputLabel}>Implementation Intention (Optional)</Text>
          <TextInput
            style={styles.input}
            value={implementationIntention}
            onChangeText={setImplementationIntention}
            placeholder="When [situation], then I will [habit]"
            maxLength={100}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  title: {
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  categoryTextSelected: {
    color: colors.surface,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  frequencyOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  frequencyTextSelected: {
    color: colors.surface,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    ...typography.body,
    marginRight: spacing.md,
    color: colors.textSecondary,
  },
  timeTextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.surface,
    minWidth: 80,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});