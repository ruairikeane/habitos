import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/user.dart';
import '../../data/services/firebase_service.dart';

enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthProvider with ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  
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
        
        // Save auth state for persistent login
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('stay_signed_in', true);
        
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
      
      // Clear persistent login preference
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('stay_signed_in', false);
      
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
      
      // Check if user wants to stay signed in
      final prefs = await SharedPreferences.getInstance();
      final staySignedIn = prefs.getBool('stay_signed_in') ?? false;
      
      // Check current Firebase user
      final firebaseUser = _firebaseService.currentUser;
      
      if (firebaseUser != null && staySignedIn) {
        _user = User(
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@').first ?? 'User',
          createdAt: firebaseUser.metadata.creationTime ?? DateTime.now(),
          updatedAt: DateTime.now(),
          emailVerified: firebaseUser.emailVerified,
        );
        _setState(AuthState.authenticated);
      } else if (firebaseUser != null && !staySignedIn) {
        // User is signed in but doesn't want to stay signed in
        await _firebaseService.signOut();
        _setState(AuthState.unauthenticated);
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

}