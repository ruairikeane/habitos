import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FirebaseAuthService } from '../../services/firebase';
import { OfflineStorageService } from '../../services/storage/offlineStorage';
import { BiometricService } from '../../services/biometric';
import { colors, typography, spacing } from '../../styles';
import type { AuthUser } from '../../services/firebase/authService';

interface FirebaseAuthWrapperProps {
  children: React.ReactNode;
}

export function FirebaseAuthWrapper({ children }: FirebaseAuthWrapperProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('');
  const [enableBiometricAfterLogin, setEnableBiometricAfterLogin] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('FirebaseAuthWrapper: Initializing authentication');
        
        // Check biometric capabilities
        const capabilities = await BiometricService.checkBiometricCapabilities();
        setBiometricAvailable(capabilities.isAvailable);
        
        if (capabilities.isAvailable) {
          const typeName = await BiometricService.getBiometricTypeName();
          setBiometricTypeName(typeName);
          
          const isEnabled = await BiometricService.isBiometricEnabled();
          setBiometricEnabled(isEnabled);
          
          console.log('FirebaseAuthWrapper: Biometric auth available:', typeName, 'enabled:', isEnabled);
        }
        
        // Check current auth state
        const currentUser = await FirebaseAuthService.getCurrentUser();
        
        if (currentUser) {
          console.log('FirebaseAuthWrapper: User authenticated:', currentUser.uid);
          setUser(currentUser);
          setLoading(false);
        } else {
          console.log('FirebaseAuthWrapper: No authenticated user');
          setLoading(false);
        }
      } catch (error) {
        console.error('FirebaseAuthWrapper: Auth initialization failed:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange((user) => {
      console.log('FirebaseAuthWrapper: Auth state changed:', user ? 'authenticated' : 'not authenticated');
      setUser(user);
      setLoading(false);
      
    });

    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isSignUp && !displayName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setAuthLoading(true);
    try {
      console.log('FirebaseAuthWrapper: Attempting auth:', isSignUp ? 'signup' : 'signin');
      
      if (isSignUp) {
        const result = await FirebaseAuthService.signUp({
          email,
          password,
          displayName
        });
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        Alert.alert('Success', 'Account created successfully!');
        setEmail('');
        setPassword('');
        setDisplayName('');
        setIsSignUp(false);
      } else {
        const result = await FirebaseAuthService.signIn({
          email,
          password
        }, enableBiometricAfterLogin);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        console.log('FirebaseAuthWrapper: Sign in successful');
        
        // Update biometric state if enabled
        if (enableBiometricAfterLogin && biometricAvailable) {
          setBiometricEnabled(true);
          Alert.alert(
            'Biometric Authentication Enabled',
            `You can now use ${biometricTypeName} to sign in quickly!`,
            [{ text: 'Great!', style: 'default' }]
          );
        }
      }
    } catch (error: any) {
      console.error('FirebaseAuthWrapper: Auth error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };


  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      Alert.alert('Error', 'Biometric authentication is not available on this device');
      return;
    }

    if (!biometricEnabled) {
      Alert.alert('Error', 'Biometric authentication is not enabled. Please sign in with your credentials first.');
      return;
    }

    setAuthLoading(true);
    try {
      console.log('FirebaseAuthWrapper: Attempting biometric login');
      const result = await FirebaseAuthService.authenticateWithBiometrics();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('FirebaseAuthWrapper: Biometric login successful');
    } catch (error: any) {
      console.error('FirebaseAuthWrapper: Biometric login error:', error);
      
      let errorMessage = 'Biometric authentication failed';
      if (error.message?.includes('cancelled')) {
        errorMessage = 'Authentication was cancelled';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, styles.loadingText]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={[typography.h2, styles.title]}>
            Welcome to Habitos
          </Text>
          <Text style={[typography.body, styles.subtitle]}>
            Build better habits, one day at a time
          </Text>

          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                placeholderTextColor={colors.textSecondary}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />

            {!isSignUp && biometricAvailable && (
              <View style={styles.biometricSection}>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setEnableBiometricAfterLogin(!enableBiometricAfterLogin)}
                >
                  <Text style={styles.switchText}>
                    {enableBiometricAfterLogin ? '✅' : '☐'} Enable {biometricTypeName} for future logins
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {!isSignUp && biometricAvailable && biometricEnabled && (
              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.success }]}
                onPress={handleBiometricLogin}
                disabled={authLoading}
              >
                <Text style={styles.authButtonText}>
                  🔒 Sign in with {biometricTypeName}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Create one"
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  authButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  switchText: {
    color: colors.primary,
    fontSize: 14,
  },
  biometricSection: {
    marginBottom: spacing.md,
  },
});