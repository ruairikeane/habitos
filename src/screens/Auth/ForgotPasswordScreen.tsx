import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setEmailSent(true);
      Alert.alert(
        'Email Sent!',
        'Please check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.error || 'Please try again');
    }
  };

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const canSubmit = email.trim() && isValidEmail(email.trim()) && !isLoading;

  if (emailSent) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.centeredContainer}>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={[typography.h2, styles.successTitle]}>
              Email Sent! 📧
            </Text>
            <Text style={[typography.body, styles.successMessage]}>
              We've sent password reset instructions to:
            </Text>
            <Text style={[typography.bodyMedium, styles.emailText]}>
              {email}
            </Text>
            <Text style={[typography.bodySmall, styles.instructionText]}>
              Please check your email and follow the instructions to reset your password.
            </Text>
            
            <TouchableOpacity
              style={[globalStyles.buttonPrimary, styles.backButton]}
              onPress={onBackToLogin}
            >
              <Text style={[globalStyles.buttonText, styles.buttonText]}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.h1, styles.title]}>
              Reset Password 🔑
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          {/* Reset Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.h6, styles.inputLabel]}>
                Email Address
              </Text>
              <View style={[styles.inputWrapper, !isValidEmail(email) && email.length > 0 && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[typography.body, styles.input]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  autoFocus
                />
              </View>
              {!isValidEmail(email) && email.length > 0 && (
                <Text style={[typography.caption, styles.errorText]}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                globalStyles.buttonPrimary,
                styles.resetButton,
                !canSubmit && globalStyles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!canSubmit}
            >
              {isLoading ? (
                <Text style={[globalStyles.buttonText, styles.buttonText]}>
                  Sending...
                </Text>
              ) : (
                <Text style={[globalStyles.buttonText, styles.buttonText]}>
                  Send Reset Instructions
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.infoContainer}>
            <Text style={[typography.bodySmall, styles.infoText]}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={onBackToLogin}>
              <Text style={[typography.bodySmallMedium, styles.loginLink]}>
                Sign in instead
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xs,
  },
  resetButton: {
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.surface,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
  },
  successContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  successTitle: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  successMessage: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emailText: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  instructionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
});