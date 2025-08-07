import 'package:flutter/material.dart';

class Category {
  final String id;
  final String userId;
  final String name;
  final Color color;
  final IconData icon;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Category({
    required this.id,
    required this.userId,
    required this.name,
    required this.color,
    required this.icon,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      color: Color(json['color'] as int),
      icon: _parseIconData(json['icon'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'color': color.value,
      'icon': _formatIconData(icon),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Category copyWith({
    String? id,
    String? userId,
    String? name,
    Color? color,
    IconData? icon,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Category(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  static IconData _parseIconData(String iconString) {
    switch (iconString) {
      case 'heart':
        return Icons.favorite_outline;
      case 'fitness':
        return Icons.fitness_center;
      case 'checkmark-circle':
        return Icons.check_circle_outline;
      case 'book':
        return Icons.menu_book_outlined;
      case 'leaf':
        return Icons.eco_outlined;
      case 'person':
        return Icons.person_outline;
      case 'people':
        return Icons.people_outline;
      case 'color-palette':
        return Icons.palette_outlined;
      case 'water':
        return Icons.water_drop_outlined;
      case 'bed':
        return Icons.bed_outlined;
      case 'restaurant':
        return Icons.restaurant_outlined;
      case 'local-cafe':
        return Icons.local_cafe_outlined;
      case 'directions-walk':
        return Icons.directions_walk_outlined;
      case 'self-improvement':
        return Icons.self_improvement_outlined;
      case 'lightbulb':
        return Icons.lightbulb_outline;
      case 'music':
        return Icons.music_note_outlined;
      case 'camera':
        return Icons.camera_alt_outlined;
      case 'brush':
        return Icons.brush_outlined;
      default:
        return Icons.circle_outlined;
    }
  }

  static String _formatIconData(IconData icon) {
    if (icon == Icons.favorite_outline) return 'heart';
    if (icon == Icons.fitness_center) return 'fitness';
    if (icon == Icons.check_circle_outline) return 'checkmark-circle';
    if (icon == Icons.menu_book_outlined) return 'book';
    if (icon == Icons.eco_outlined) return 'leaf';
    if (icon == Icons.person_outline) return 'person';
    if (icon == Icons.people_outline) return 'people';
    if (icon == Icons.palette_outlined) return 'color-palette';
    if (icon == Icons.water_drop_outlined) return 'water';
    if (icon == Icons.bed_outlined) return 'bed';
    if (icon == Icons.restaurant_outlined) return 'restaurant';
    if (icon == Icons.local_cafe_outlined) return 'local-cafe';
    if (icon == Icons.directions_walk_outlined) return 'directions-walk';
    if (icon == Icons.self_improvement_outlined) return 'self-improvement';
    if (icon == Icons.lightbulb_outline) return 'lightbulb';
    if (icon == Icons.music_note_outlined) return 'music';
    if (icon == Icons.camera_alt_outlined) return 'camera';
    if (icon == Icons.brush_outlined) return 'brush';
    return 'circle';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Category &&
        other.id == id &&
        other.userId == userId &&
        other.name == name &&
        other.color == color &&
        other.icon == icon &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      name,
      color,
      icon,
      createdAt,
      updatedAt,
    );
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name, color: ${color.value})';
  }
}