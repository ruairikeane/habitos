import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

enum HabitFrequency {
  daily('daily'),
  weekly('weekly'),
  monthly('monthly'),
  custom('custom');

  const HabitFrequency(this.value);
  final String value;

  static HabitFrequency fromString(String value) {
    return HabitFrequency.values.firstWhere(
      (frequency) => frequency.value == value,
      orElse: () => HabitFrequency.daily,
    );
  }
}

class CustomFrequency {
  final HabitFrequency type;
  final List<int> daysOfWeek; // 0-6, Sunday = 0
  final int? timesPerWeek;
  final int? timesPerMonth;

  const CustomFrequency({
    required this.type,
    required this.daysOfWeek,
    this.timesPerWeek,
    this.timesPerMonth,
  });

  factory CustomFrequency.fromJson(Map<String, dynamic> json) {
    return CustomFrequency(
      type: HabitFrequency.custom,
      daysOfWeek: List<int>.from(json['daysOfWeek'] as List),
      timesPerWeek: json['timesPerWeek'] as int?,
      timesPerMonth: json['timesPerMonth'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.value,
      'daysOfWeek': daysOfWeek,
      if (timesPerWeek != null) 'timesPerWeek': timesPerWeek,
      if (timesPerMonth != null) 'timesPerMonth': timesPerMonth,
    };
  }
}

class Habit {
  final String id;
  final String userId;
  final String name;
  final String? description;
  final String categoryId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;
  final TimeOfDay? reminderTime;
  final HabitFrequency frequency;
  final CustomFrequency? customFrequency;
  final Color color;
  final IconData icon;
  final String? habitStacking;
  final String? implementationIntention;

  const Habit({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    required this.categoryId,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
    this.reminderTime,
    required this.frequency,
    this.customFrequency,
    required this.color,
    required this.icon,
    this.habitStacking,
    this.implementationIntention,
  });

  factory Habit.fromJson(Map<String, dynamic> json) {
    return Habit(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      categoryId: json['category_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      isActive: json['is_active'] as bool? ?? true,
      reminderTime: json['reminder_time'] != null 
          ? _parseTimeOfDay(json['reminder_time'] as String)
          : null,
      frequency: HabitFrequency.fromString(json['frequency'] as String),
      customFrequency: json['custom_frequency'] != null
          ? CustomFrequency.fromJson(json['custom_frequency'] as Map<String, dynamic>)
          : null,
      color: Color(json['color'] as int),
      icon: _parseIconData(json['icon'] as String),
      habitStacking: json['habit_stacking'] as String?,
      implementationIntention: json['implementation_intention'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      if (description != null) 'description': description,
      'category_id': categoryId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_active': isActive,
      if (reminderTime != null) 'reminder_time': _formatTimeOfDay(reminderTime!),
      'frequency': frequency.value,
      if (customFrequency != null) 'custom_frequency': customFrequency!.toJson(),
      'color': color.value,
      'icon': _formatIconData(icon),
      if (habitStacking != null) 'habit_stacking': habitStacking,
      if (implementationIntention != null) 'implementation_intention': implementationIntention,
    };
  }

  // Firestore serialization methods
  factory Habit.fromFirestore(Map<String, dynamic> data) {
    return Habit(
      id: data['id'] as String,
      userId: data['userId']?.toString() ?? '',
      name: data['name']?.toString() ?? 'Unnamed Habit',
      description: data['description']?.toString(),
      categoryId: data['categoryId']?.toString() ?? 'general',
      createdAt: _parseFirestoreDate(data['createdAt']),
      updatedAt: _parseFirestoreDate(data['updatedAt']),
      isActive: data['isActive'] as bool? ?? true,
      reminderTime: data['reminderTime'] != null 
          ? _parseTimeOfDay(data['reminderTime'].toString())
          : null,
      frequency: HabitFrequency.fromString(data['frequency']?.toString() ?? 'daily'),
      customFrequency: data['customFrequency'] != null
          ? CustomFrequency.fromJson(data['customFrequency'] as Map<String, dynamic>)
          : null,
      color: data['color'] != null ? Color(data['color'] as int) : const Color(0xFF7A8471),
      icon: data['icon'] != null ? _parseIconData(data['icon'] as String) : Icons.check_circle_outline,
      habitStacking: data['habitStacking']?.toString(),
      implementationIntention: data['implementationIntention']?.toString(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'name': name,
      if (description != null) 'description': description,
      'categoryId': categoryId,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'isActive': isActive,
      if (reminderTime != null) 'reminderTime': _formatTimeOfDay(reminderTime!),
      'frequency': frequency.value,
      if (customFrequency != null) 'customFrequency': customFrequency!.toJson(),
      'color': color.value,
      'icon': _formatIconData(icon),
      if (habitStacking != null) 'habitStacking': habitStacking,
      if (implementationIntention != null) 'implementationIntention': implementationIntention,
    };
  }

  Habit copyWith({
    String? id,
    String? userId,
    String? name,
    String? description,
    String? categoryId,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isActive,
    TimeOfDay? reminderTime,
    HabitFrequency? frequency,
    CustomFrequency? customFrequency,
    Color? color,
    IconData? icon,
    String? habitStacking,
    String? implementationIntention,
  }) {
    return Habit(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isActive: isActive ?? this.isActive,
      reminderTime: reminderTime ?? this.reminderTime,
      frequency: frequency ?? this.frequency,
      customFrequency: customFrequency ?? this.customFrequency,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      habitStacking: habitStacking ?? this.habitStacking,
      implementationIntention: implementationIntention ?? this.implementationIntention,
    );
  }

  static DateTime _parseFirestoreDate(dynamic dateValue) {
    if (dateValue is Timestamp) {
      return dateValue.toDate();
    } else if (dateValue is String) {
      return DateTime.parse(dateValue);
    } else {
      // Fallback to current time if neither
      return DateTime.now();
    }
  }

  static TimeOfDay _parseTimeOfDay(String timeString) {
    final parts = timeString.split(':');
    return TimeOfDay(
      hour: int.parse(parts[0]),
      minute: int.parse(parts[1]),
    );
  }

  static String _formatTimeOfDay(TimeOfDay time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  static IconData _parseIconData(String iconString) {
    // Map icon strings to Flutter IconData
    switch (iconString) {
      case 'heart':
        return Icons.favorite_outline;
      case 'fitness':
        return Icons.fitness_center;
      case 'checkmark':
        return Icons.check_circle_outline;
      case 'book':
        return Icons.menu_book_outlined;
      case 'leaf':
        return Icons.eco_outlined;
      case 'person':
        return Icons.person_outline;
      case 'people':
        return Icons.people_outline;
      case 'palette':
        return Icons.palette_outlined;
      default:
        return Icons.circle_outlined;
    }
  }

  static String _formatIconData(IconData icon) {
    // Map Flutter IconData back to string
    if (icon == Icons.favorite_outline) return 'heart';
    if (icon == Icons.fitness_center) return 'fitness';
    if (icon == Icons.check_circle_outline) return 'checkmark';
    if (icon == Icons.menu_book_outlined) return 'book';
    if (icon == Icons.eco_outlined) return 'leaf';
    if (icon == Icons.person_outline) return 'person';
    if (icon == Icons.people_outline) return 'people';
    if (icon == Icons.palette_outlined) return 'palette';
    return 'circle';
  }
}

class HabitStreak {
  final int current;
  final int longest;
  final DateTime? lastCompletedDate;

  const HabitStreak({
    required this.current,
    required this.longest,
    this.lastCompletedDate,
  });

  factory HabitStreak.fromJson(Map<String, dynamic> json) {
    return HabitStreak(
      current: json['current'] as int,
      longest: json['longest'] as int,
      lastCompletedDate: json['lastCompletedDate'] != null
          ? DateTime.parse(json['lastCompletedDate'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current': current,
      'longest': longest,
      if (lastCompletedDate != null) 'lastCompletedDate': lastCompletedDate!.toIso8601String(),
    };
  }
}

class HabitStats {
  final int totalCompletions;
  final double completionRate; // 0-1
  final int currentStreak;
  final int longestStreak;
  final double averageCompletionsPerWeek;
  final List<bool> lastSevenDays;
  final double monthlyProgress; // 0-1 for current month

  const HabitStats({
    required this.totalCompletions,
    required this.completionRate,
    required this.currentStreak,
    required this.longestStreak,
    required this.averageCompletionsPerWeek,
    required this.lastSevenDays,
    required this.monthlyProgress,
  });

  factory HabitStats.fromJson(Map<String, dynamic> json) {
    return HabitStats(
      totalCompletions: json['totalCompletions'] as int,
      completionRate: (json['completionRate'] as num).toDouble(),
      currentStreak: json['currentStreak'] as int,
      longestStreak: json['longestStreak'] as int,
      averageCompletionsPerWeek: (json['averageCompletionsPerWeek'] as num).toDouble(),
      lastSevenDays: List<bool>.from(json['lastSevenDays'] as List),
      monthlyProgress: (json['monthlyProgress'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalCompletions': totalCompletions,
      'completionRate': completionRate,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'averageCompletionsPerWeek': averageCompletionsPerWeek,
      'lastSevenDays': lastSevenDays,
      'monthlyProgress': monthlyProgress,
    };
  }
}