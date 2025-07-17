import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import type { AboutScreenProps } from '@/types';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export function AboutScreen({ navigation }: AboutScreenProps) {
  const handleLinkPress = (url: string, title: string) => {
    Alert.alert(
      title,
      `This would open: ${url}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, you would use Linking.openURL(url)
            Alert.alert('External Link', `Opening ${url} in browser...`);
          }
        }
      ]
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. This app stores all data locally on your device and does not collect or transmit any personal information to external servers.',
      [{ text: 'OK' }]
    );
  };

  const showTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'By using this app, you agree to use it for personal habit tracking purposes only. The app is provided "as is" without warranties.',
      [{ text: 'OK' }]
    );
  };

  const showOpenSourceLicenses = () => {
    Alert.alert(
      'Open Source Licenses',
      'This app uses several open source libraries including React Native, Expo, Zustand, and others. Full license information would be displayed here.',
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
            About
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={[globalStyles.card, styles.appInfoCard]}>
            <View style={styles.appIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
            </View>
            <Text style={[typography.h3, styles.appName]}>
              Habitos
            </Text>
            <Text style={[typography.body, styles.appDescription]}>
              A beautiful habit tracking app designed to help you build sustainable habits with science-based guidance.
            </Text>
            <View style={styles.versionInfo}>
              <Text style={[typography.caption, styles.versionText]}>
                Version {APP_VERSION} (Build {BUILD_NUMBER})
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            ✨ Features
          </Text>
          
          <View style={[globalStyles.card, styles.featuresCard]}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              <Text style={[typography.body, styles.featureText]}>
                Track daily habits with beautiful progress visualization
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="analytics-outline" size={20} color={colors.primary} />
              <Text style={[typography.body, styles.featureText]}>
                Detailed statistics and streak tracking
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.warning} />
              <Text style={[typography.body, styles.featureText]}>
                Science-based tips and habit formation guidance
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={20} color={colors.learning} />
              <Text style={[typography.body, styles.featureText]}>
                Smart reminders to help you stay consistent
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.mindfulness} />
              <Text style={[typography.body, styles.featureText]}>
                Offline-first design - works without internet
              </Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            👥 Credits
          </Text>
          
          <View style={[globalStyles.card, styles.creditsCard]}>
            <View style={styles.creditItem}>
              <Text style={[typography.bodyMedium, styles.creditTitle]}>
                Design Inspiration
              </Text>
              <Text style={[typography.body, styles.creditDescription]}>
                Based on principles from "Atomic Habits" by James Clear
              </Text>
            </View>

            <View style={styles.creditItem}>
              <Text style={[typography.bodyMedium, styles.creditTitle]}>
                Color Palette
              </Text>
              <Text style={[typography.body, styles.creditDescription]}>
                Earth-tone colors designed for calm and focus
              </Text>
            </View>

            <View style={styles.creditItem}>
              <Text style={[typography.bodyMedium, styles.creditTitle]}>
                Icons
              </Text>
              <Text style={[typography.body, styles.creditDescription]}>
                Ionicons by Ionic Framework
              </Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            📋 Legal
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.legalCard]}
            onPress={showPrivacyPolicy}
          >
            <View style={styles.legalContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
              <Text style={[typography.bodyMedium, styles.legalTitle]}>
                Privacy Policy
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.legalCard]}
            onPress={showTermsOfService}
          >
            <View style={styles.legalContent}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, styles.legalTitle]}>
                Terms of Service
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.legalCard]}
            onPress={showOpenSourceLicenses}
          >
            <View style={styles.legalContent}>
              <Ionicons name="code-slash-outline" size={24} color={colors.learning} />
              <Text style={[typography.bodyMedium, styles.legalTitle]}>
                Open Source Licenses
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            💬 Support
          </Text>
          
          <TouchableOpacity 
            style={[globalStyles.card, styles.supportCard]}
            onPress={() => handleLinkPress('mailto:support@habitos.app', 'Email Support')}
          >
            <View style={styles.supportContent}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
              <View style={styles.supportText}>
                <Text style={[typography.bodyMedium, styles.supportTitle]}>
                  Email Support
                </Text>
                <Text style={[typography.caption, styles.supportDescription]}>
                  support@habitos.app
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.card, styles.supportCard]}
            onPress={() => handleLinkPress('https://github.com/habitos/habitos', 'GitHub')}
          >
            <View style={styles.supportContent}>
              <Ionicons name="logo-github" size={24} color={colors.textPrimary} />
              <View style={styles.supportText}>
                <Text style={[typography.bodyMedium, styles.supportTitle]}>
                  GitHub Repository
                </Text>
                <Text style={[typography.caption, styles.supportDescription]}>
                  Report issues and contribute
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[typography.caption, styles.footerText]}>
            Built with ❤️ for helping you build better habits
          </Text>
          <Text style={[typography.caption, styles.footerText]}>
            © 2025 Habitos. All rights reserved.
          </Text>
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
  appInfoCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: colors.primary,
    textAlign: 'center',
  },
  appDescription: {
    textAlign: 'center',
    lineHeight: 22,
    color: colors.textSecondary,
  },
  versionInfo: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  versionText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresCard: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    color: colors.textPrimary,
  },
  creditsCard: {
    gap: spacing.md,
  },
  creditItem: {
    gap: spacing.xs,
  },
  creditTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  creditDescription: {
    color: colors.textSecondary,
  },
  legalCard: {
    marginBottom: spacing.sm,
  },
  legalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legalTitle: {
    flex: 1,
    color: colors.textPrimary,
  },
  supportCard: {
    marginBottom: spacing.sm,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  supportText: {
    flex: 1,
    gap: spacing.xs,
  },
  supportTitle: {
    color: colors.textPrimary,
  },
  supportDescription: {
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});