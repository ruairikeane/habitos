import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export function AuthWrapper() {
  const [mode, setMode] = useState<AuthMode>('login');

  const handleSwitchToSignup = () => setMode('signup');
  const handleSwitchToLogin = () => setMode('login');
  const handleForgotPassword = () => setMode('forgot-password');

  return (
    <View style={styles.container}>
      {mode === 'login' && (
        <LoginScreen
          onSwitchToSignup={handleSwitchToSignup}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {mode === 'signup' && (
        <SignupScreen onSwitchToLogin={handleSwitchToLogin} />
      )}
      {mode === 'forgot-password' && (
        <ForgotPasswordScreen onBackToLogin={handleSwitchToLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});