import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '../../styles';
import type { HelpSupportScreenProps } from '../../types';

const FAQ_ITEMS = [
  {
    question: 'How do I create a new habit?',
    answer: 'Go to the Habits tab and tap "Add New Habit". Choose a category, set your frequency, and optionally add reminders.',
  },
  {
    question: 'How are streaks calculated?',
    answer: 'Streaks count consecutive days where you completed your habit. Missing a day resets the streak to 0.',
  },
  {
    question: 'Can I edit or delete habits?',
    answer: 'Yes! In the Habits tab, tap the three dots menu on any habit card to edit or delete it.',
  },
  {
    question: 'How do I set up notifications?',
    answer: 'Go to Settings > Notifications to manage your reminder preferences and enable notifications.',
  },
  {
    question: 'Is my data stored online?',
    answer: 'No, all your data is stored locally on your device for privacy. You can export your data for backup.',
  },
  {
    question: 'How do I backup my data?',
    answer: 'Go to Settings → Data & Backup to export your habits and entries to a file.',
  },
];

export function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'You can reach us at support@habitos.app for any questions or issues.',
      [{ text: 'OK' }]
    );
  };

  const handleFeatureRequest = () => {
    Alert.alert(
      'Feature Request',
      'We love hearing your ideas! Please send your feature requests to feedback@habitos.app.',
      [{ text: 'OK' }]
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
            Help & Support
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Getting Started */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🚀 Getting Started
          </Text>
          
          <View style={[globalStyles.card, styles.guideCard]}>
            <Text style={[typography.h5, styles.guideTitle]}>
              Welcome to Habitos!
            </Text>
            <Text style={[typography.body, styles.guideContent]}>
              Here's how to get started building great habits:
            </Text>
            
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[typography.body, styles.stepText]}>
                  Create your first habit in the Habits tab
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[typography.body, styles.stepText]}>
                  Check off completed habits on the Home screen
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[typography.body, styles.stepText]}>
                  Track your progress in the Statistics tab
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[typography.body, styles.stepText]}>
                  Read tips and strategies in the Tips tab
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ❓ Frequently Asked Questions
          </Text>
          
          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[globalStyles.card, styles.faqCard]}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={[typography.bodyMedium, styles.faqQuestion]}>
                  {item.question}
                </Text>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </View>
              
              {expandedFAQ === index && (
                <View style={styles.faqAnswer}>
                  <Text style={[typography.body, styles.faqAnswerText]}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            🔧 Troubleshooting
          </Text>
          
          <View style={[globalStyles.card, styles.troubleshootCard]}>
            <View style={styles.troubleshootItem}>
              <Text style={[typography.bodyMedium, styles.troubleshootTitle]}>
                Notifications not working?
              </Text>
              <Text style={[typography.body, styles.troubleshootText]}>
                Check your device settings and ensure notifications are enabled for Habitos. Also check battery optimization settings.
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={[typography.bodyMedium, styles.troubleshootTitle]}>
                App feels slow?
              </Text>
              <Text style={[typography.body, styles.troubleshootText]}>
                Try restarting the app or your device. Large amounts of data can occasionally slow performance.
              </Text>
            </View>

            <View style={styles.troubleshootItem}>
              <Text style={[typography.bodyMedium, styles.troubleshootTitle]}>
                Lost your data?
              </Text>
              <Text style={[typography.body, styles.troubleshootText]}>
                Data is stored locally on your device. If you have a backup file, you can restore it from Settings → Data & Backup.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📞 Contact Us
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.contactCard]}
            onPress={handleContactSupport}
          >
            <View style={styles.contactContent}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
              <View style={styles.contactText}>
                <Text style={[typography.bodyMedium, styles.contactTitle]}>
                  Email Support
                </Text>
                <Text style={[typography.caption, styles.contactDescription]}>
                  Get help with technical issues
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.contactCard]}
            onPress={handleFeatureRequest}
          >
            <View style={styles.contactContent}>
              <Ionicons name="bulb-outline" size={24} color={colors.warning} />
              <View style={styles.contactText}>
                <Text style={[typography.bodyMedium, styles.contactTitle]}>
                  Feature Request
                </Text>
                <Text style={[typography.caption, styles.contactDescription]}>
                  Suggest new features or improvements
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
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
  guideCard: {
    gap: spacing.md,
  },
  guideTitle: {
    color: colors.primary,
  },
  guideContent: {
    color: colors.textSecondary,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    color: colors.textPrimary,
  },
  faqCard: {
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  faqAnswer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqAnswerText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  troubleshootCard: {
    gap: spacing.md,
  },
  troubleshootItem: {
    gap: spacing.xs,
  },
  troubleshootTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  troubleshootText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    marginBottom: spacing.sm,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactText: {
    flex: 1,
    gap: spacing.xs,
  },
  contactTitle: {
    color: colors.textPrimary,
  },
  contactDescription: {
    color: colors.textSecondary,
  },
});