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

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await signUp({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Success!',
        'Account created successfully. Please check your email to verify your account.',
        [{ text: 'OK', onPress: onSwitchToLogin }]
      );
    } else {
      Alert.alert('Signup Failed', result.error || 'Please try again');
    }
  };

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordValid = password.length >= 6;
  
  const canSubmit = 
    displayName.trim() && 
    email.trim() && 
    password.trim() && 
    confirmPassword.trim() &&
    isValidEmail(email.trim()) && 
    passwordValid &&
    passwordsMatch &&
    !isLoading;

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.h1, styles.title]}>
              Start your journey! 🚀
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              Create your Habitos account
            </Text>
          </View>

          {/* Signup Form */}
          <View style={styles.form}>
            {/* Display Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.h6, styles.inputLabel]}>
                Display Name
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[typography.body, styles.input]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.h6, styles.inputLabel]}>
                Email
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
                />
              </View>
              {!isValidEmail(email) && email.length > 0 && (
                <Text style={[typography.caption, styles.errorText]}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.h6, styles.inputLabel]}>
                Password
              </Text>
              <View style={[styles.inputWrapper, password.length > 0 && !passwordValid && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[typography.body, styles.input]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && !passwordValid && (
                <Text style={[typography.caption, styles.errorText]}>
                  Password must be at least 6 characters
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.h6, styles.inputLabel]}>
                Confirm Password
              </Text>
              <View style={[styles.inputWrapper, confirmPassword.length > 0 && !passwordsMatch && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[typography.body, styles.input]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={[typography.caption, styles.errorText]}>
                  Passwords do not match
                </Text>
              )}
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                globalStyles.buttonPrimary,
                styles.signupButton,
                !canSubmit && globalStyles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={!canSubmit}
            >
              {isLoading ? (
                <Text style={[globalStyles.buttonText, styles.buttonText]}>
                  Creating account...
                </Text>
              ) : (
                <Text style={[globalStyles.buttonText, styles.buttonText]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[typography.caption, styles.termsText]}>
              By creating an account, you agree to our terms of service and privacy policy.
            </Text>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={[typography.body, styles.footerText]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={[typography.bodyMedium, styles.loginLink]}>
                Sign in
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
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
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
  passwordToggle: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xs,
  },
  signupButton: {
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.surface,
  },
  termsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
  },
});