import 'package:cloud_firestore/cloud_firestore.dart';

class HabitEntry {
  final String id;
  final String habitId;
  final String userId;
  final DateTime date;
  final String dateString; // YYYY-MM-DD format
  final bool isCompleted;
  final String? notes;
  final DateTime? completedAt;
  final DateTime createdAt;

  const HabitEntry({
    required this.id,
    required this.habitId,
    required this.userId,
    required this.date,
    required this.dateString,
    required this.isCompleted,
    this.notes,
    this.completedAt,
    required this.createdAt,
  });

  factory HabitEntry.fromJson(Map<String, dynamic> json) {
    final entryDate = json['entry_date'] as String;
    return HabitEntry(
      id: json['id'] as String,
      habitId: json['habit_id'] as String,
      userId: json['user_id'] as String,
      date: DateTime.parse(entryDate),
      dateString: entryDate,
      isCompleted: json['is_completed'] as bool,
      notes: json['notes'] as String?,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  // Firestore serialization methods
  factory HabitEntry.fromFirestore(Map<String, dynamic> data) {
    return HabitEntry(
      id: data['id'] as String,
      habitId: data['habitId'] as String,
      userId: data['userId'] as String,
      date: (data['date'] as Timestamp).toDate(),
      dateString: data['dateString'] as String,
      isCompleted: data['isCompleted'] as bool,
      notes: data['notes'] as String?,
      completedAt: data['completedAt'] != null
          ? (data['completedAt'] as Timestamp).toDate()
          : null,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'habitId': habitId,
      'userId': userId,
      'date': Timestamp.fromDate(date),
      'dateString': dateString,
      'isCompleted': isCompleted,
      if (notes != null) 'notes': notes,
      if (completedAt != null) 'completedAt': Timestamp.fromDate(completedAt!),
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'habit_id': habitId,
      'user_id': userId,
      'entry_date': dateString,
      'is_completed': isCompleted,
      if (notes != null) 'notes': notes,
      if (completedAt != null) 'completed_at': completedAt!.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  HabitEntry copyWith({
    String? id,
    String? habitId,
    String? userId,
    DateTime? date,
    String? dateString,
    bool? isCompleted,
    String? notes,
    DateTime? completedAt,
    DateTime? createdAt,
  }) {
    return HabitEntry(
      id: id ?? this.id,
      habitId: habitId ?? this.habitId,
      userId: userId ?? this.userId,
      date: date ?? this.date,
      dateString: dateString ?? this.dateString,
      isCompleted: isCompleted ?? this.isCompleted,
      notes: notes ?? this.notes,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is HabitEntry &&
        other.id == id &&
        other.habitId == habitId &&
        other.userId == userId &&
        other.dateString == dateString &&
        other.isCompleted == isCompleted &&
        other.notes == notes &&
        other.completedAt == completedAt &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      habitId,
      userId,
      dateString,
      isCompleted,
      notes,
      completedAt,
      createdAt,
    );
  }

  @override
  String toString() {
    return 'HabitEntry(id: $id, habitId: $habitId, dateString: $dateString, isCompleted: $isCompleted)';
  }
}