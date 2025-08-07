import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/habit.dart';
import '../models/habit_entry.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? get currentUser => _auth.currentUser;
  bool get isAuthenticated => currentUser != null;

  // Collections
  CollectionReference get habitsCollection => _firestore.collection('habits');
  CollectionReference get habitEntriesCollection => _firestore.collection('habit_entries');
  CollectionReference get categoriesCollection => _firestore.collection('categories');

  // Auth methods
  Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<UserCredential> createUserWithEmailAndPassword(String email, String password) async {
    return await _auth.createUserWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Habit operations
  Future<List<Habit>> getUserHabits() async {
    if (!isAuthenticated) return [];

    try {
      print('🔍 Firebase: Querying habits for user: ${currentUser!.uid}');
      final query = await habitsCollection
          .where('userId', isEqualTo: currentUser!.uid)
          .where('isActive', isEqualTo: true)
          .get();
      print('🔍 Firebase: Found ${query.docs.length} habit documents');

      return query.docs.map((doc) {
        try {
          final data = doc.data() as Map<String, dynamic>;
          data['id'] = doc.id; // Ensure ID is set from document ID
          
          // Debug: Check for missing required fields
          if (data['color'] == null) print('Warning: Document ${doc.id} missing color field');
          if (data['icon'] == null) print('Warning: Document ${doc.id} missing icon field');
          
          return Habit.fromFirestore(data);
        } catch (e) {
          print('Error parsing habit document ${doc.id}: $e');
          print('Document data: ${doc.data()}');
          rethrow;
        }
      }).toList();
    } catch (e) {
      print('Error fetching habits: $e');
      return [];
    }
  }

  Future<String> addHabit(Habit habit) async {
    if (!isAuthenticated) throw Exception('User not authenticated');

    try {
      final docRef = await habitsCollection.add(habit.toFirestore());
      return docRef.id;
    } catch (e) {
      print('Error adding habit: $e');
      rethrow;
    }
  }

  Future<void> updateHabit(Habit habit) async {
    if (!isAuthenticated) throw Exception('User not authenticated');

    try {
      await habitsCollection.doc(habit.id).update(habit.toFirestore());
    } catch (e) {
      print('Error updating habit: $e');
      rethrow;
    }
  }

  Future<void> deleteHabit(String habitId) async {
    if (!isAuthenticated) throw Exception('User not authenticated');

    try {
      // Soft delete by setting isActive to false
      await habitsCollection.doc(habitId).update({'isActive': false});
    } catch (e) {
      print('Error deleting habit: $e');
      rethrow;
    }
  }

  // Habit entry operations
  Future<List<HabitEntry>> getHabitEntries(String habitId, {DateTime? startDate, DateTime? endDate}) async {
    if (!isAuthenticated) return [];

    try {
      Query query = habitEntriesCollection
          .where('habitId', isEqualTo: habitId)
          .where('userId', isEqualTo: currentUser!.uid);

      if (startDate != null) {
        query = query.where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startDate));
      }
      if (endDate != null) {
        query = query.where('date', isLessThanOrEqualTo: Timestamp.fromDate(endDate));
      }

      final querySnapshot = await query.orderBy('date', descending: true).get();

      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return HabitEntry.fromFirestore(data);
      }).toList();
    } catch (e) {
      print('Error fetching habit entries: $e');
      return [];
    }
  }

  Future<HabitEntry?> getHabitEntryForDate(String habitId, DateTime date) async {
    if (!isAuthenticated) return null;

    try {
      final dateString = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      
      final query = await habitEntriesCollection
          .where('habitId', isEqualTo: habitId)
          .where('userId', isEqualTo: currentUser!.uid)
          .where('dateString', isEqualTo: dateString)
          .limit(1)
          .get();

      if (query.docs.isNotEmpty) {
        final data = query.docs.first.data() as Map<String, dynamic>;
        data['id'] = query.docs.first.id;
        return HabitEntry.fromFirestore(data);
      }
      return null;
    } catch (e) {
      print('Error fetching habit entry: $e');
      return null;
    }
  }

  Future<void> addOrUpdateHabitEntry(HabitEntry entry) async {
    if (!isAuthenticated) throw Exception('User not authenticated');

    try {
      // Check if entry already exists for this date
      final dateString = '${entry.date.year}-${entry.date.month.toString().padLeft(2, '0')}-${entry.date.day.toString().padLeft(2, '0')}';
      
      final existingQuery = await habitEntriesCollection
          .where('habitId', isEqualTo: entry.habitId)
          .where('userId', isEqualTo: currentUser!.uid)
          .where('dateString', isEqualTo: dateString)
          .limit(1)
          .get();

      if (existingQuery.docs.isNotEmpty) {
        // Update existing entry
        await habitEntriesCollection.doc(existingQuery.docs.first.id).update(entry.toFirestore());
      } else {
        // Add new entry
        await habitEntriesCollection.add(entry.toFirestore());
      }
    } catch (e) {
      print('Error adding/updating habit entry: $e');
      rethrow;
    }
  }

  Future<void> deleteHabitEntry(String entryId) async {
    if (!isAuthenticated) throw Exception('User not authenticated');

    try {
      await habitEntriesCollection.doc(entryId).delete();
    } catch (e) {
      print('Error deleting habit entry: $e');
      rethrow;
    }
  }

  // Statistics and analytics
  Future<Map<String, dynamic>> getHabitStatistics(String habitId, DateTime startDate, DateTime endDate) async {
    if (!isAuthenticated) return {};

    try {
      final entries = await getHabitEntries(habitId, startDate: startDate, endDate: endDate);
      
      final completedDays = entries.where((entry) => entry.isCompleted).length;
      final totalDays = entries.length;
      final completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0.0;

      // Calculate streak
      int currentStreak = 0;
      entries.sort((a, b) => b.date.compareTo(a.date)); // Sort by date descending
      
      for (final entry in entries) {
        if (entry.isCompleted) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        'completedDays': completedDays,
        'totalDays': totalDays,
        'completionRate': completionRate,
        'currentStreak': currentStreak,
        'entries': entries,
      };
    } catch (e) {
      print('Error fetching habit statistics: $e');
      return {};
    }
  }

  // Real-time streams
  Stream<List<Habit>> getUserHabitsStream() {
    if (!isAuthenticated) return Stream.value([]);

    return habitsCollection
        .where('userId', isEqualTo: currentUser!.uid)
        .where('isActive', isEqualTo: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return Habit.fromFirestore(data);
      }).toList();
    });
  }

  Stream<List<HabitEntry>> getHabitEntriesStream(String habitId) {
    if (!isAuthenticated) return Stream.value([]);

    return habitEntriesCollection
        .where('habitId', isEqualTo: habitId)
        .where('userId', isEqualTo: currentUser!.uid)
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return HabitEntry.fromFirestore(data);
      }).toList();
    });
  }
}