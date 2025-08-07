import 'package:flutter/foundation.dart';
import '../../data/models/habit.dart';
import '../../data/models/habit_entry.dart';
import '../../data/models/category.dart' as models;
import '../../core/utils/date_helpers.dart';

class HabitsProvider with ChangeNotifier {
  List<Habit> _habits = [];
  List<HabitEntry> _entries = [];
  List<models.Category> _categories = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Habit> get habits => _habits;
  List<HabitEntry> get entries => _entries;
  List<models.Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Get habits for today
  List<Habit> get todaysHabits {
    return _habits.where((habit) => habit.isActive).toList();
  }

  // Get completed habits for today
  List<String> get todaysCompletedHabits {
    final today = DateHelpers.getTodayLocalDate();
    return _entries
        .where((entry) => entry.entryDate == today && entry.isCompleted)
        .map((entry) => entry.habitId)
        .toList();
  }

  // Get habit by ID
  Habit? getHabitById(String habitId) {
    try {
      return _habits.firstWhere((habit) => habit.id == habitId);
    } catch (e) {
      return null;
    }
  }

  // Check if habit is completed today
  bool isHabitCompletedToday(String habitId) {
    final today = DateHelpers.getTodayLocalDate();
    return _entries.any((entry) => 
        entry.habitId == habitId && 
        entry.entryDate == today && 
        entry.isCompleted);
  }

  // Get habit completion for specific date
  bool isHabitCompletedOnDate(String habitId, String date) {
    return _entries.any((entry) => 
        entry.habitId == habitId && 
        entry.entryDate == date && 
        entry.isCompleted);
  }

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

  Future<void> loadHabits() async {
    try {
      _setLoading(true);
      
      // TODO: Load from local database and Firebase
      await Future.delayed(const Duration(milliseconds: 500));
      
      // For now, use empty lists
      _habits = [];
      _entries = [];
      
      _setLoading(false);
    } catch (e) {
      _setError('Failed to load habits: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> loadCategories() async {
    try {
      _setLoading(true);
      
      // TODO: Load from local database
      await Future.delayed(const Duration(milliseconds: 300));
      
      _categories = [];
      
      _setLoading(false);
    } catch (e) {
      _setError('Failed to load categories: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> toggleHabitCompletion(String habitId) async {
    try {
      final today = DateHelpers.getTodayLocalDate();
      final existingEntryIndex = _entries.indexWhere((entry) => 
          entry.habitId == habitId && entry.entryDate == today);

      if (existingEntryIndex != -1) {
        // Update existing entry
        final entry = _entries[existingEntryIndex];
        final updatedEntry = entry.copyWith(
          isCompleted: !entry.isCompleted,
          completedAt: !entry.isCompleted ? DateTime.now() : null,
        );
        _entries[existingEntryIndex] = updatedEntry;
        
        // TODO: Update in database
      } else {
        // Create new entry
        final newEntry = HabitEntry(
          id: 'entry_${DateTime.now().millisecondsSinceEpoch}',
          habitId: habitId,
          userId: 'current-user-id', // TODO: Get from auth provider
          entryDate: today,
          isCompleted: true,
          completedAt: DateTime.now(),
          createdAt: DateTime.now(),
        );
        _entries.add(newEntry);
        
        // TODO: Save to database
      }

      notifyListeners();
    } catch (e) {
      _setError('Failed to update habit: ${e.toString()}');
    }
  }

  Future<void> addHabit(Habit habit) async {
    try {
      _setLoading(true);
      
      // TODO: Save to database
      await Future.delayed(const Duration(milliseconds: 500));
      
      _habits.add(habit);
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to add habit: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> updateHabit(Habit habit) async {
    try {
      _setLoading(true);
      
      // TODO: Update in database
      await Future.delayed(const Duration(milliseconds: 500));
      
      final index = _habits.indexWhere((h) => h.id == habit.id);
      if (index != -1) {
        _habits[index] = habit;
      }
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to update habit: ${e.toString()}');
      _setLoading(false);
    }
  }

  Future<void> deleteHabit(String habitId) async {
    try {
      _setLoading(true);
      
      // TODO: Delete from database
      await Future.delayed(const Duration(milliseconds: 500));
      
      _habits.removeWhere((habit) => habit.id == habitId);
      _entries.removeWhere((entry) => entry.habitId == habitId);
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to delete habit: ${e.toString()}');
      _setLoading(false);
    }
  }
}