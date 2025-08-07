import 'package:flutter/widgets.dart';
import '../../data/models/habit.dart';
import '../../data/models/habit_entry.dart';
import '../../data/models/category.dart' as models;
import '../../data/services/firebase_service.dart';
import '../../core/utils/date_helpers.dart';

class HabitsProvider with ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();
  
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
    print('📊 Getting todaysHabits from ${_habits.length} total habits');
    final activeHabits = _habits.where((habit) => habit.isActive).toList();
    print('📊 Active habits: ${activeHabits.length}');
    for (final habit in activeHabits) {
      print('  ✅ ${habit.name} (active: ${habit.isActive})');
    }
    return activeHabits;
  }

  // Get completed habits for today
  List<String> get todaysCompletedHabits {
    final today = DateHelpers.getTodayLocalDate();
    return _entries
        .where((entry) => entry.dateString == today && entry.isCompleted)
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
        entry.dateString == today && 
        entry.isCompleted);
  }

  // Get habit completion for specific date
  bool isHabitCompletedOnDate(String habitId, String date) {
    return _entries.any((entry) => 
        entry.habitId == habitId && 
        entry.dateString == date && 
        entry.isCompleted);
  }

  void _setLoading(bool loading) {
    if (_isLoading != loading) {
      _isLoading = loading;
      // Use post frame callback to avoid setState during build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        notifyListeners();
      });
    }
  }

  void _setError(String message) {
    _errorMessage = message;
    // Use post frame callback to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      notifyListeners();
    });
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> loadHabits() async {
    print('🔄 PROVIDER: Starting loadHabits()...');
    try {
      _setLoading(true);
      
      if (_firebaseService.isAuthenticated) {
        // Load habits from Firebase (force fresh data)
        _habits = await _firebaseService.getUserHabits();
        
        // Load recent habit entries (last 30 days)
        final startDate = DateTime.now().subtract(const Duration(days: 30));
        final allEntries = <HabitEntry>[];
        
        for (final habit in _habits) {
          final entries = await _firebaseService.getHabitEntries(
            habit.id, 
            startDate: startDate
          );
          allEntries.addAll(entries);
        }
        
        _entries = allEntries;
        
        print('✅ Successfully loaded ${_habits.length} habits');
        for (final habit in _habits) {
          print('  - ${habit.name} (${habit.categoryId})');
        }
      } else {
        // Use empty lists if not authenticated
        _habits = [];
        _entries = [];
      }
      
      _setLoading(false);
    } catch (e) {
      print('Error loading habits: $e');
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
      if (!_firebaseService.isAuthenticated) {
        _setError('Please sign in to track habits');
        return;
      }

      final today = DateHelpers.getTodayLocalDate();
      final existingEntryIndex = _entries.indexWhere((entry) => 
          entry.habitId == habitId && entry.dateString == today);

      if (existingEntryIndex != -1) {
        // Update existing entry
        final entry = _entries[existingEntryIndex];
        final updatedEntry = entry.copyWith(
          isCompleted: !entry.isCompleted,
          completedAt: !entry.isCompleted ? DateTime.now() : null,
        );
        _entries[existingEntryIndex] = updatedEntry;
        
        // Update in Firebase
        await _firebaseService.addOrUpdateHabitEntry(updatedEntry);
      } else {
        // Create new entry
        final dateTime = DateTime.parse(today);
        final newEntry = HabitEntry(
          id: 'entry_${DateTime.now().millisecondsSinceEpoch}',
          habitId: habitId,
          userId: _firebaseService.currentUser!.uid,
          date: dateTime,
          dateString: today,
          isCompleted: true,
          completedAt: DateTime.now(),
          createdAt: DateTime.now(),
        );
        _entries.add(newEntry);
        
        // Save to Firebase
        await _firebaseService.addOrUpdateHabitEntry(newEntry);
      }

      notifyListeners();
    } catch (e) {
      _setError('Failed to update habit: ${e.toString()}');
    }
  }

  Future<void> addHabit(Habit habit) async {
    try {
      _setLoading(true);
      
      if (!_firebaseService.isAuthenticated) {
        _setError('Please sign in to add habits');
        _setLoading(false);
        return;
      }

      // Save to Firebase and get the document ID
      final docId = await _firebaseService.addHabit(habit);
      
      // Update habit with the Firebase document ID
      final habitWithId = habit.copyWith(id: docId);
      
      print('🎆 Adding habit to local list:');
      print('  Name: ${habitWithId.name}');
      print('  ID: ${habitWithId.id}');
      print('  isActive: ${habitWithId.isActive}');
      print('  categoryId: ${habitWithId.categoryId}');
      
      // Add to local list with proper ID
      _habits.add(habitWithId);
      
      print('📊 Total habits after add: ${_habits.length}');
      
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
      
      if (!_firebaseService.isAuthenticated) {
        _setError('Please sign in to update habits');
        _setLoading(false);
        return;
      }

      // Update in Firebase
      await _firebaseService.updateHabit(habit);
      
      // Update local list
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
      
      if (!_firebaseService.isAuthenticated) {
        _setError('Please sign in to delete habits');
        _setLoading(false);
        return;
      }

      // Delete from Firebase (soft delete)
      await _firebaseService.deleteHabit(habitId);
      
      // Remove from local lists
      _habits.removeWhere((habit) => habit.id == habitId);
      _entries.removeWhere((entry) => entry.habitId == habitId);
      
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError('Failed to delete habit: ${e.toString()}');
      _setLoading(false);
    }
  }

  // Authentication helpers
  bool get isAuthenticated => _firebaseService.isAuthenticated;
  String? get currentUserId => _firebaseService.currentUser?.uid;
}