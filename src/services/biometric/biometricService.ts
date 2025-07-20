import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  supportedTypes: string[];
  isEnrolled: boolean;
  hasHardware: boolean;
}

export class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
  private static readonly STORED_CREDENTIALS_KEY = 'stored_user_credentials';

  // Check if biometric authentication is available
  static async checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      console.log('BiometricService: Checking device capabilities...');
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('BiometricService: Hardware available:', hasHardware);
      console.log('BiometricService: Biometrics enrolled:', isEnrolled);
      console.log('BiometricService: Supported types:', supportedTypes);
      console.log('BiometricService: Platform:', Platform.OS);
      
      const typeNames = supportedTypes.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Touch ID / Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID / Face Recognition';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris Recognition';
          default:
            return 'Biometric';
        }
      });

      const capabilities = {
        isAvailable: hasHardware && isEnrolled,
        supportedTypes: typeNames,
        isEnrolled,
        hasHardware
      };
      
      console.log('BiometricService: Final capabilities:', capabilities);
      return capabilities;
    } catch (error) {
      console.error('BiometricService: Error checking capabilities:', error);
      return {
        isAvailable: false,
        supportedTypes: [],
        isEnrolled: false,
        hasHardware: false
      };
    }
  }

  // Authenticate with biometrics
  static async authenticateWithBiometrics(
    promptMessage: string = 'Use your biometric to authenticate'
  ): Promise<BiometricAuthResult> {
    try {
      console.log('BiometricService: Starting authentication process');
      
      const capabilities = await this.checkBiometricCapabilities();
      console.log('BiometricService: Capabilities:', capabilities);
      
      if (!capabilities.isAvailable) {
        console.log('BiometricService: Biometric auth not available');
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      console.log('BiometricService: Calling LocalAuthentication.authenticateAsync');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false, // Allow device PIN/password fallback
      });

      console.log('BiometricService: Authentication result:', result);

      if (result.success) {
        console.log('BiometricService: Authentication successful');
        return {
          success: true,
          biometricType: capabilities.supportedTypes[0] || 'Biometric'
        };
      } else {
        console.log('BiometricService: Authentication failed:', result.error);
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('BiometricService: Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed due to an error'
      };
    }
  }

  // Store user credentials securely for biometric login
  static async storeCredentialsForBiometric(email: string, encryptedData: string): Promise<boolean> {
    try {
      const credentials = {
        email,
        encryptedData,
        timestamp: Date.now()
      };

      await SecureStore.setItemAsync(
        this.STORED_CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );
      
      console.log('BiometricService: Credentials stored securely');
      return true;
    } catch (error) {
      console.error('BiometricService: Error storing credentials:', error);
      return false;
    }
  }

  // Retrieve stored credentials
  static async getStoredCredentials(): Promise<{ email: string; encryptedData: string } | null> {
    try {
      const credentialsString = await SecureStore.getItemAsync(this.STORED_CREDENTIALS_KEY);
      
      if (!credentialsString) {
        return null;
      }

      const credentials = JSON.parse(credentialsString);
      return {
        email: credentials.email,
        encryptedData: credentials.encryptedData
      };
    } catch (error) {
      console.error('BiometricService: Error retrieving credentials:', error);
      return null;
    }
  }

  // Enable/disable biometric authentication
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        this.BIOMETRIC_ENABLED_KEY,
        enabled.toString()
      );
      console.log('BiometricService: Biometric auth', enabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('BiometricService: Error setting biometric preference:', error);
    }
  }

  // Check if biometric authentication is enabled
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('BiometricService: Error checking biometric preference:', error);
      return false;
    }
  }

  // Clear stored credentials
  static async clearStoredCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.STORED_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(this.BIOMETRIC_ENABLED_KEY);
      console.log('BiometricService: Stored credentials cleared');
    } catch (error) {
      console.error('BiometricService: Error clearing credentials:', error);
    }
  }

  // Get biometric type name for display
  static async getBiometricTypeName(): Promise<string> {
    const capabilities = await this.checkBiometricCapabilities();
    
    if (capabilities.supportedTypes.length > 0) {
      return capabilities.supportedTypes[0];
    }
    
    // Fallback based on platform
    if (Platform.OS === 'ios') {
      return 'Face ID / Touch ID';
    } else {
      return 'Biometric Authentication';
    }
  }
}