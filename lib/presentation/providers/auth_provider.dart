import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/user.dart';
import '../../data/services/firebase_service.dart';
import '../../data/services/biometric_service.dart';

enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthProvider with ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  final BiometricService _biometricService = BiometricService();
  
  AuthState _state = AuthState.initial;
  User? _user;
  String? _errorMessage;
  String? _lastSignInEmail;
  String? _lastSignInPassword;

  AuthState get state => _state;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _state == AuthState.authenticated;
  bool get isLoading => _state == AuthState.loading;

  void _setState(AuthState newState) {
    _state = newState;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    _setState(AuthState.error);
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> signIn(String email, String password) async {
    try {
      _setState(AuthState.loading);
      
      // Sign in with Firebase
      final userCredential = await _firebaseService.signInWithEmailAndPassword(email, password);
      final firebaseUser = userCredential.user;
      
      if (firebaseUser != null) {
        _user = User(
          id: firebaseUser.uid,
          email: firebaseUser.email ?? email,
          displayName: firebaseUser.displayName ?? email.split('@').first,
          createdAt: firebaseUser.metadata.creationTime ?? DateTime.now(),
          updatedAt: DateTime.now(),
          emailVerified: firebaseUser.emailVerified,
        );
        
        // Store credentials for biometric auth
        _lastSignInEmail = email;
        _lastSignInPassword = password;
        await _saveCredentialsForBiometric(email, password);
        
        _setState(AuthState.authenticated);
      } else {
        _setError('Sign in failed - no user returned');
      }
    } catch (e) {
      _setError('Failed to sign in: ${e.toString()}');
    }
  }

  Future<void> signUp(String email, String password) async {
    try {
      _setState(AuthState.loading);
      
      // Create account with Firebase
      final userCredential = await _firebaseService.createUserWithEmailAndPassword(email, password);
      final firebaseUser = userCredential.user;
      
      if (firebaseUser != null) {
        _user = User(
          id: firebaseUser.uid,
          email: firebaseUser.email ?? email,
          displayName: firebaseUser.displayName ?? email.split('@').first,
          createdAt: firebaseUser.metadata.creationTime ?? DateTime.now(),
          updatedAt: DateTime.now(),
          emailVerified: firebaseUser.emailVerified,
        );
        
        _setState(AuthState.authenticated);
      } else {
        _setError('Sign up failed - no user returned');
      }
    } catch (e) {
      _setError('Failed to create account: ${e.toString()}');
    }
  }

  Future<void> signOut() async {
    try {
      _setState(AuthState.loading);
      
      // Sign out from Firebase
      await _firebaseService.signOut();
      
      _user = null;
      _setState(AuthState.unauthenticated);
    } catch (e) {
      _setError('Failed to sign out: ${e.toString()}');
    }
  }

  Future<void> checkAuthState() async {
    try {
      _setState(AuthState.loading);
      
      // Check current Firebase user
      final firebaseUser = _firebaseService.currentUser;
      
      if (firebaseUser != null) {
        _user = User(
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@').first ?? 'User',
          createdAt: firebaseUser.metadata.creationTime ?? DateTime.now(),
          updatedAt: DateTime.now(),
          emailVerified: firebaseUser.emailVerified,
        );
        _setState(AuthState.authenticated);
      } else {
        _setState(AuthState.unauthenticated);
      }
    } catch (e) {
      _setError('Failed to check auth state: ${e.toString()}');
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      _setState(AuthState.loading);
      
      // Send password reset email with Firebase
      await firebase_auth.FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      
      // Return to unauthenticated state after reset request
      _setState(AuthState.unauthenticated);
    } catch (e) {
      _setError('Failed to reset password: ${e.toString()}');
    }
  }

  Future<void> _saveCredentialsForBiometric(String email, String password) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('biometric_email', email);
    await prefs.setString('biometric_password', password);
  }

  Future<bool> canUseBiometricSignIn() async {
    try {
      final isEnabled = await _biometricService.isBiometricEnabled();
      final isAvailable = await _biometricService.isBiometricAvailable();
      final prefs = await SharedPreferences.getInstance();
      final hasCredentials = prefs.getString('biometric_email') != null;
      
      return isEnabled && isAvailable && hasCredentials;
    } catch (e) {
      return false;
    }
  }

  Future<void> signInWithBiometrics() async {
    try {
      _setState(AuthState.loading);
      
      // Check if biometric is available and enabled
      final canUse = await canUseBiometricSignIn();
      if (!canUse) {
        _setError('Biometric authentication not available');
        return;
      }
      
      // Authenticate with biometrics
      final isAuthenticated = await _biometricService.authenticate(
        reason: 'Sign in to Habitos',
      );
      
      if (!isAuthenticated) {
        _setState(AuthState.unauthenticated);
        return;
      }
      
      // Get stored credentials
      final prefs = await SharedPreferences.getInstance();
      final email = prefs.getString('biometric_email');
      final password = prefs.getString('biometric_password');
      
      if (email == null || password == null) {
        _setError('No stored credentials found');
        return;
      }
      
      // Sign in with stored credentials
      await signIn(email, password);
      
    } catch (e) {
      _setError('Biometric sign-in failed: ${e.toString()}');
    }
  }

  Future<void> clearBiometricCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('biometric_email');
    await prefs.remove('biometric_password');
  }
}