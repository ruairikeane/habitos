import 'package:flutter/foundation.dart';
import '../../data/models/user.dart';

class SettingsProvider with ChangeNotifier {
  UserSettings? _settings;
  bool _isLoading = false;
  String? _errorMessage;

  UserSettings? get settings => _settings;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool get biometricEnabled => _settings?.biometricEnabled ?? false;
  bool get notificationsEnabled => _settings?.notificationsEnabled ?? true;
  String get theme => _settings?.theme ?? 'system';
  String? get defaultReminderTime => _settings?.defaultReminderTime;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> loadSettings(String userId) async {
    try {
      _setLoading(true);
      
      // TODO: Load from SharedPreferences and Firebase
      await Future.delayed(const Duration(milliseconds: 300));
      
      _settings = UserSettings(
        userId: userId,
        biometricEnabled: false,
        notificationsEnabled: true,
        theme: 'system',
        updatedAt: DateTime.now(),
      );
      
      _setLoading(false);
    } catch (e) {
      _setError('Failed to load settings: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> updateBiometricEnabled(bool enabled) async {
    try {
      if (_settings == null) return;
      
      _setLoading(true);
      
      final updatedSettings = _settings!.copyWith(
        biometricEnabled: enabled,
        updatedAt: DateTime.now(),
      );
      
      // TODO: Save to SharedPreferences and Firebase
      await Future.delayed(const Duration(milliseconds: 200));
      
      _settings = updatedSettings;
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to update biometric setting: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> updateNotificationsEnabled(bool enabled) async {
    try {
      if (_settings == null) return;
      
      _setLoading(true);
      
      final updatedSettings = _settings!.copyWith(
        notificationsEnabled: enabled,
        updatedAt: DateTime.now(),
      );
      
      // TODO: Save to SharedPreferences and Firebase
      await Future.delayed(const Duration(milliseconds: 200));
      
      _settings = updatedSettings;
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to update notification setting: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> updateTheme(String theme) async {
    try {
      if (_settings == null) return;
      
      _setLoading(true);
      
      final updatedSettings = _settings!.copyWith(
        theme: theme,
        updatedAt: DateTime.now(),
      );
      
      // TODO: Save to SharedPreferences and Firebase
      await Future.delayed(const Duration(milliseconds: 200));
      
      _settings = updatedSettings;
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to update theme: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> updateDefaultReminderTime(String? time) async {
    try {
      if (_settings == null) return;
      
      _setLoading(true);
      
      final updatedSettings = _settings!.copyWith(
        defaultReminderTime: time,
        updatedAt: DateTime.now(),
      );
      
      // TODO: Save to SharedPreferences and Firebase
      await Future.delayed(const Duration(milliseconds: 200));
      
      _settings = updatedSettings;
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to update reminder time: ${e.toString()}');
      _setLoading(false);
    }
  }
}