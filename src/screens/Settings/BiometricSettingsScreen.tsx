import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, globalStyles, spacing } from '@/styles';
import { BiometricService } from '@/services/biometric';
import { FirebaseAuthService } from '@/services/firebase';
import type { BiometricCapabilities } from '@/services/biometric/biometricService';
import type { BiometricSettingsScreenProps } from '@/types/navigation';

export function BiometricSettingsScreen({ navigation }: BiometricSettingsScreenProps) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    supportedTypes: [],
    isEnrolled: false,
    hasHardware: false
  });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    try {
      setLoading(true);
      
      // Check device capabilities
      const deviceCapabilities = await BiometricService.checkBiometricCapabilities();
      setCapabilities(deviceCapabilities);
      
      // Get biometric type name
      const typeName = await BiometricService.getBiometricTypeName();
      setBiometricTypeName(typeName);
      
      // Check if biometric auth is enabled
      const isEnabled = await BiometricService.isBiometricEnabled();
      setBiometricEnabled(isEnabled);
      
      console.log('BiometricSettings: Loaded settings', {
        available: deviceCapabilities.isAvailable,
        enabled: isEnabled,
        type: typeName
      });
    } catch (error) {
      console.error('BiometricSettings: Error loading settings:', error);
      Alert.alert('Error', 'Failed to load biometric settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!capabilities.isAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }

    try {
      if (enabled) {
        // Enabling biometric auth
        Alert.alert(
          'Enable Biometric Authentication',
          `Would you like to enable ${biometricTypeName} for quick sign-in?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enable', 
              onPress: async () => {
                try {
                  // Test biometric authentication first
                  const authResult = await BiometricService.authenticateWithBiometrics(
                    `Verify your ${biometricTypeName} to enable this feature`
                  );
                  
                  if (authResult.success) {
                    // Check if user has stored credentials
                    const storedCredentials = await BiometricService.getStoredCredentials();
                    if (!storedCredentials) {
                      Alert.alert(
                        'No Stored Credentials',
                        'Please sign in with your email and password first, then enable biometric authentication during login.',
                        [{ text: 'OK' }]
                      );
                      return;
                    }
                    
                    await BiometricService.setBiometricEnabled(true);
                    setBiometricEnabled(true);
                    
                    Alert.alert(
                      'Success',
                      `${biometricTypeName} authentication has been enabled!`,
                      [{ text: 'Great!' }]
                    );
                  } else {
                    Alert.alert('Authentication Failed', authResult.error || 'Could not verify biometric authentication');
                  }
                } catch (error) {
                  console.error('BiometricSettings: Error enabling biometric auth:', error);
                  Alert.alert('Error', 'Failed to enable biometric authentication');
                }
              }
            }
          ]
        );
      } else {
        // Disabling biometric auth
        Alert.alert(
          'Disable Biometric Authentication',
          `Are you sure you want to disable ${biometricTypeName} authentication?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Disable', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await BiometricService.setBiometricEnabled(false);
                  setBiometricEnabled(false);
                  
                  Alert.alert(
                    'Disabled',
                    `${biometricTypeName} authentication has been disabled`,
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  console.error('BiometricSettings: Error disabling biometric auth:', error);
                  Alert.alert('Error', 'Failed to disable biometric authentication');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('BiometricSettings: Error toggling biometric auth:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  const handleTestBiometric = async () => {
    if (!capabilities.isAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }

    try {
      console.log('BiometricSettings: Starting biometric test...');
      
      Alert.alert(
        'Testing Biometric Authentication',
        'This will now prompt you to use your biometric authentication. If no prompt appears, the feature may not be working in your current environment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Test Now', 
            onPress: async () => {
              console.log('BiometricSettings: User confirmed test, calling authentication...');
              
              const result = await BiometricService.authenticateWithBiometrics(
                `Test your ${biometricTypeName} authentication`
              );
              
              console.log('BiometricSettings: Test result:', result);
              
              if (result.success) {
                Alert.alert(
                  'Success!',
                  `${biometricTypeName} authentication is working perfectly! Did you see the biometric prompt?`,
                  [{ text: 'Yes, it worked!' }, { text: 'No prompt appeared' }]
                );
              } else {
                Alert.alert(
                  'Test Failed', 
                  `Error: ${result.error || 'Authentication test failed'}\n\nThis might be because:\n• You're using a simulator\n• Biometrics aren't set up on your device\n• The app doesn't have permission`
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('BiometricSettings: Error testing biometric auth:', error);
      Alert.alert('Error', 'Failed to test biometric authentication');
    }
  };

  const handleClearCredentials = async () => {
    Alert.alert(
      'Clear Stored Credentials',
      'This will remove your stored login credentials. You will need to sign in again to re-enable biometric authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await BiometricService.clearStoredCredentials();
              setBiometricEnabled(false);
              
              Alert.alert(
                'Cleared',
                'Stored credentials have been cleared',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('BiometricSettings: Error clearing credentials:', error);
              Alert.alert('Error', 'Failed to clear stored credentials');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.body, styles.loadingText]}>Loading biometric settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={globalStyles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[typography.h3, styles.headerTitle]}>
            Biometric Authentication
          </Text>
        </View>

        {/* Device Status */}
        <View style={[globalStyles.card, styles.statusCard]}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name="finger-print" 
              size={32} 
              color={capabilities.isAvailable ? colors.success : colors.textSecondary} 
            />
            <Text style={[typography.h4, styles.statusTitle]}>
              Device Status
            </Text>
          </View>
          
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Hardware Support:</Text>
              <Text style={[styles.statusValue, { color: capabilities.hasHardware ? colors.success : colors.error }]}>
                {capabilities.hasHardware ? '✅ Available' : '❌ Not Available'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Biometric Enrolled:</Text>
              <Text style={[styles.statusValue, { color: capabilities.isEnrolled ? colors.success : colors.warning }]}>
                {capabilities.isEnrolled ? '✅ Enrolled' : '⚠️ Not Enrolled'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Available Types:</Text>
              <Text style={styles.statusValue}>
                {capabilities.supportedTypes.length > 0 ? capabilities.supportedTypes.join(', ') : 'None'}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={[globalStyles.card, styles.settingsCard]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[typography.body, styles.settingLabel]}>
                Enable {biometricTypeName}
              </Text>
              <Text style={[typography.caption, styles.settingDescription]}>
                Use biometric authentication for quick sign-in
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!capabilities.isAvailable}
              trackColor={{ false: colors.border, true: colors.success + '40' }}
              thumbColor={biometricEnabled ? colors.success : colors.textSecondary}
            />
          </View>
        </View>

        {/* Actions */}
        {capabilities.isAvailable && (
          <View style={[globalStyles.card, styles.actionsCard]}>
            <Text style={[typography.h4, styles.sectionTitle]}>Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestBiometric}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
              <Text style={[typography.body, styles.actionButtonText]}>
                Test {biometricTypeName}
              </Text>
            </TouchableOpacity>
            
            {biometricEnabled && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearCredentials}
              >
                <Ionicons name="trash-outline" size={24} color={colors.error} />
                <Text style={[typography.body, styles.actionButtonText, { color: colors.error }]}>
                  Clear Stored Credentials
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Diagnostic Information */}
        <View style={[globalStyles.card, styles.diagnosticCard]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Diagnostic Information</Text>
          <Text style={[typography.caption, styles.diagnosticText]}>
            <Text style={styles.diagnosticLabel}>Environment: </Text>
            {__DEV__ ? 'Development' : 'Production'}
          </Text>
          <Text style={[typography.caption, styles.diagnosticText]}>
            <Text style={styles.diagnosticLabel}>Platform: </Text>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
          <Text style={[typography.caption, styles.diagnosticText]}>
            <Text style={styles.diagnosticLabel}>Expected Type: </Text>
            {biometricTypeName || 'None detected'}
          </Text>
          <Text style={[typography.caption, styles.diagnosticText]}>
            <Text style={styles.diagnosticLabel}>Note: </Text>
            {Platform.OS === 'ios' && __DEV__ ? 'Face ID doesn\'t work in iOS Simulator - use a physical device' : 'Should work on physical device'}
          </Text>
        </View>

        {/* Help */}
        <View style={[globalStyles.card, styles.helpCard]}>
          <Text style={[typography.h4, styles.sectionTitle]}>Help</Text>
          <Text style={[typography.body, styles.helpText]}>
            {!capabilities.hasHardware && 
              "Your device doesn't support biometric authentication. "
            }
            {capabilities.hasHardware && !capabilities.isEnrolled && 
              "Please enroll your biometric data in your device settings first. "
            }
            {capabilities.isAvailable && !biometricEnabled &&
              "Sign in with your email and password, then enable biometric authentication during login. "
            }
            {capabilities.isAvailable && biometricEnabled &&
              "Biometric authentication is active. You can now sign in quickly using your biometric data."
            }
          </Text>
          
          {Platform.OS === 'ios' && __DEV__ && (
            <Text style={[typography.caption, styles.warningText]}>
              ⚠️ Note: Face ID doesn't work in iOS Simulator. Test on a physical device for real Face ID functionality.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    marginLeft: spacing.sm,
  },
  statusList: {
    gap: spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusValue: {
    ...typography.body,
    fontWeight: '500',
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    marginBottom: spacing.xs,
  },
  settingDescription: {
    color: colors.textSecondary,
  },
  actionsCard: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: spacing.sm,
  },
  helpCard: {
    marginBottom: spacing.lg,
  },
  helpText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  diagnosticCard: {
    marginBottom: spacing.lg,
  },
  diagnosticText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  diagnosticLabel: {
    fontWeight: '500',
    color: colors.textPrimary,
  },
  warningText: {
    color: colors.warning,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});