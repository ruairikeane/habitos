import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, SupabaseConnectionTester, RetryHelper } from '@/services/supabase';
import { SyncService } from '@/services/sync/syncService';
import { OfflineStorageService } from '@/services/storage/offlineStorage';
import { initializeNewUser } from '@/services/initializeUser';
import { colors, typography, spacing } from '@/styles';
import type { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('checking');
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  // Log for debugging and prevent TS unused warnings  
  console.log('Auth state:', { connectionStatus, offlineMode, loading });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setConnectionStatus('testing connection...');
        
        // Test connection first
        let diagnostics;
        try {
          diagnostics = await SupabaseConnectionTester.runDiagnostics();
        } catch (error) {
          console.log('Connection test failed, using offline mode:', error);
          setConnectionStatus('offline mode - network blocked');
          setOfflineMode(true);
          
          // Load offline data if available
          const offlineData = await OfflineStorageService.loadOfflineData();
          console.log(`Loaded ${offlineData.habits.length} offline habits`);
          
          setLoading(false);
          return;
        }
        
        if (!diagnostics.overall) {
          setConnectionStatus(`connection failed: ${diagnostics.rest.error || diagnostics.auth.error}`);
          setOfflineMode(true);
          
          // Load offline data as fallback
          const offlineData = await OfflineStorageService.loadOfflineData();
          console.log(`Connection failed, loaded ${offlineData.habits.length} offline habits`);
          
          setLoading(false);
          return;
        }
        
        setConnectionStatus('connected');
        setOfflineMode(false);
        
        // Load connection state from storage
        await SupabaseConnectionTester.loadConnectionState();
        
        // Check current auth state with retry
        const { data: { user } } = await RetryHelper.withRetry(
          () => supabase.auth.getUser(),
          3,
          1000
        );
        
        setUser(user);
        
        // Start sync service if user is authenticated
        if (user) {
          SyncService.startAutoSync();
          const status = await SyncService.getSyncStatus();
          setSyncStatus(status);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setConnectionStatus(`initialization failed: ${(error as Error).message}`);
        setOfflineMode(true);
        
        // Load offline data if available
        const offlineData = await OfflineStorageService.loadOfflineData();
        if (offlineData.habits.length > 0) {
          console.log('Loading offline data');
          // Could set a temporary offline user here if needed
        }
        
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Initialize new user with default categories
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await RetryHelper.withRetry(
            () => initializeNewUser(session.user!.id),
            2,
            1000
          );
          
          // Start sync service
          SyncService.startAutoSync();
          const status = await SyncService.getSyncStatus();
          setSyncStatus(status);
          setOfflineMode(false);
        } catch (error) {
          console.error('User initialization failed:', error);
          setOfflineMode(true);
        }
      }
      
      // Stop sync service on sign out
      if (event === 'SIGNED_OUT') {
        SyncService.stopAutoSync();
        setSyncStatus(null);
        setOfflineMode(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    try {
      console.log('Attempting auth with:', email, isSignUp ? 'signup' : 'signin');
      
      if (isSignUp) {
        const { data, error } = await RetryHelper.withRetry(
          () => supabase.auth.signUp({ email, password }),
          3,
          1000
        );
        console.log('Signup response:', { data, error });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for verification link!');
      } else {
        const { data, error } = await RetryHelper.withRetry(
          () => supabase.auth.signInWithPassword({ email, password }),
          3,
          1000
        );
        console.log('Signin response:', { data, error });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        name: error.name
      });
      
      // More specific error messages
      let errorMessage = 'Unable to connect to authentication service';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out functionality - can be used in Settings screen later
  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  // };

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

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={async () => {
                const results = [];
                
                // Test multiple endpoints including Supabase auth
                const endpoints = [
                  { name: 'Google', url: 'https://www.google.com' },
                  { name: 'Supabase REST', url: 'https://ynucnsbytysmsjugozzt.supabase.co/rest/v1/' },
                  { name: 'Supabase Auth', url: 'https://ynucnsbytysmsjugozzt.supabase.co/auth/v1/settings' },
                  { name: 'GitHub API', url: 'https://api.github.com' },
                  { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1' }
                ];
                
                for (const endpoint of endpoints) {
                  try {
                    const response = await fetch(endpoint.url, { 
                      method: 'GET',
                      headers: endpoint.name === 'Supabase' ? {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludWNuc2J5dGpzbXNqdWdvenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzI0MzMsImV4cCI6MjA2Nzg0ODQzM30.KikDllZnO1ZYTbx6lqjeOc-MMUebVljN1DDOY_Lsreo'
                      } : {}
                    });
                    results.push(`${endpoint.name}: ${response.ok ? '✅ OK' : '❌ FAIL'} (${response.status})`);
                  } catch (error) {
                    results.push(`${endpoint.name}: ❌ BLOCKED (${(error as Error).message})`);
                  }
                }
                
                Alert.alert('Network Diagnostic', results.join('\n'));
              }}
            >
              <Text style={styles.testText}>Network Diagnostic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: colors.secondary }]}
              onPress={async () => {
                // Enhanced offline mode
                const tempUser = { id: 'offline_user', email: email || 'offline@local.com' } as any;
                setUser(tempUser);
                setOfflineMode(true);
                
                // Load any existing offline data
                const offlineData = await OfflineStorageService.loadOfflineData();
                console.log(`Loaded ${offlineData.habits.length} offline habits`);
                
                Alert.alert(
                  'Offline Mode', 
                  'Using offline mode. Your data will be saved locally and synced when internet connection is restored.',
                  [
                    { text: 'Continue', style: 'default' }
                  ]
                );
              }}
            >
              <Text style={styles.authButtonText}>
                Continue Offline
              </Text>
            </TouchableOpacity>

            {syncStatus && (
              <View style={styles.syncStatusContainer}>
                <Text style={styles.syncStatusText}>
                  {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
                  {syncStatus.hasPendingOperations && ` • ${syncStatus.operationCount} pending`}
                </Text>
                {syncStatus.lastSync && (
                  <Text style={styles.syncStatusSubtext}>
                    Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.manualSyncButton}
              onPress={async () => {
                try {
                  const success = await SyncService.forcSync();
                  const status = await SyncService.getSyncStatus();
                  setSyncStatus(status);
                  
                  Alert.alert(
                    'Sync Status',
                    success ? 'Sync completed successfully' : 'Sync failed - check connection'
                  );
                } catch (error) {
                  Alert.alert('Sync Error', 'Failed to sync data');
                }
              }}
            >
              <Text style={styles.testText}>Force Sync Now</Text>
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
  testButton: {
    alignItems: 'center',
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  testText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  syncStatusContainer: {
    alignItems: 'center',
    padding: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  syncStatusText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  syncStatusSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  manualSyncButton: {
    alignItems: 'center',
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
});