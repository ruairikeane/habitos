class HabitEntry {
  final String id;
  final String habitId;
  final String userId;
  final String entryDate; // YYYY-MM-DD format
  final bool isCompleted;
  final String? notes;
  final DateTime? completedAt;
  final DateTime createdAt;

  const HabitEntry({
    required this.id,
    required this.habitId,
    required this.userId,
    required this.entryDate,
    required this.isCompleted,
    this.notes,
    this.completedAt,
    required this.createdAt,
  });

  factory HabitEntry.fromJson(Map<String, dynamic> json) {
    return HabitEntry(
      id: json['id'] as String,
      habitId: json['habit_id'] as String,
      userId: json['user_id'] as String,
      entryDate: json['entry_date'] as String,
      isCompleted: json['is_completed'] as bool,
      notes: json['notes'] as String?,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'habit_id': habitId,
      'user_id': userId,
      'entry_date': entryDate,
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
    String? entryDate,
    bool? isCompleted,
    String? notes,
    DateTime? completedAt,
    DateTime? createdAt,
  }) {
    return HabitEntry(
      id: id ?? this.id,
      habitId: habitId ?? this.habitId,
      userId: userId ?? this.userId,
      entryDate: entryDate ?? this.entryDate,
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
        other.entryDate == entryDate &&
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
      entryDate,
      isCompleted,
      notes,
      completedAt,
      createdAt,
    );
  }

  @override
  String toString() {
    return 'HabitEntry(id: $id, habitId: $habitId, entryDate: $entryDate, isCompleted: $isCompleted)';
  }
}