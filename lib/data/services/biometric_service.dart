import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();

  final LocalAuthentication _localAuth = LocalAuthentication();
  static const String _biometricEnabledKey = 'biometric_enabled';

  /// Check if biometric authentication is available on the device
  Future<bool> isBiometricAvailable() async {
    try {
      final bool isAvailable = await _localAuth.canCheckBiometrics;
      if (!isAvailable) return false;
      
      final List<BiometricType> availableBiometrics = await _localAuth.getAvailableBiometrics();
      return availableBiometrics.isNotEmpty;
    } catch (e) {
      print('Error checking biometric availability: $e');
      return false;
    }
  }

  /// Get list of available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      print('Error getting available biometrics: $e');
      return [];
    }
  }

  /// Get user-friendly name for biometric authentication
  Future<String> getBiometricDisplayName() async {
    try {
      final availableBiometrics = await getAvailableBiometrics();
      
      if (availableBiometrics.contains(BiometricType.face)) {
        return 'Face ID';
      } else if (availableBiometrics.contains(BiometricType.fingerprint)) {
        return 'Touch ID';
      } else if (availableBiometrics.contains(BiometricType.iris)) {
        return 'Iris Recognition';
      } else {
        return 'Biometric Authentication';
      }
    } catch (e) {
      return 'Biometric Authentication';
    }
  }

  /// Authenticate using biometrics
  Future<bool> authenticate({
    String? reason,
  }) async {
    try {
      final bool isAvailable = await isBiometricAvailable();
      if (!isAvailable) return false;

      final displayName = await getBiometricDisplayName();
      final authReason = reason ?? 'Use $displayName to access your habits';

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: authReason,
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      return didAuthenticate;
    } catch (e) {
      print('Biometric authentication error: $e');
      return false;
    }
  }

  /// Check if biometric authentication is enabled in app settings
  Future<bool> isBiometricEnabled() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_biometricEnabledKey) ?? false;
    } catch (e) {
      print('Error checking biometric enabled status: $e');
      return false;
    }
  }

  /// Enable or disable biometric authentication in app settings
  Future<bool> setBiometricEnabled(bool enabled) async {
    try {
      // First check if biometrics are available
      if (enabled && !(await isBiometricAvailable())) {
        throw Exception('Biometric authentication is not available on this device');
      }

      // If enabling, verify with biometric authentication first
      if (enabled) {
        final bool authenticated = await authenticate(
          reason: 'Authenticate to enable biometric sign-in',
        );
        if (!authenticated) {
          return false; // Authentication failed or was cancelled
        }
      }

      // Save the setting
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_biometricEnabledKey, enabled);
      
      return true;
    } catch (e) {
      print('Error setting biometric enabled: $e');
      return false;
    }
  }

  /// Prompt user to sign in with biometrics (for app unlock)
  Future<bool> authenticateForAppUnlock() async {
    try {
      final bool isEnabled = await isBiometricEnabled();
      if (!isEnabled) return false;

      return await authenticate(
        reason: 'Use biometrics to unlock Habitos',
      );
    } catch (e) {
      print('Error during app unlock authentication: $e');
      return false;
    }
  }

  /// Clear biometric settings (useful for sign out or reset)
  Future<void> clearBiometricSettings() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove(_biometricEnabledKey);
    } catch (e) {
      print('Error clearing biometric settings: $e');
    }
  }
}