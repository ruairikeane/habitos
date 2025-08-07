class User {
  final String id;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool emailVerified;

  const User({
    required this.id,
    required this.email,
    this.displayName,
    this.photoUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.emailVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['display_name'] as String?,
      photoUrl: json['photo_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      emailVerified: json['email_verified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      if (displayName != null) 'display_name': displayName,
      if (photoUrl != null) 'photo_url': photoUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'email_verified': emailVerified,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? emailVerified,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      emailVerified: emailVerified ?? this.emailVerified,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User &&
        other.id == id &&
        other.email == email &&
        other.displayName == displayName &&
        other.photoUrl == photoUrl &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt &&
        other.emailVerified == emailVerified;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      email,
      displayName,
      photoUrl,
      createdAt,
      updatedAt,
      emailVerified,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, email: $email, displayName: $displayName)';
  }
}

class UserSettings {
  final String userId;
  final bool biometricEnabled;
  final bool notificationsEnabled;
  final String? defaultReminderTime;
  final String theme; // 'light', 'dark', 'system'
  final DateTime updatedAt;

  const UserSettings({
    required this.userId,
    required this.biometricEnabled,
    required this.notificationsEnabled,
    this.defaultReminderTime,
    required this.theme,
    required this.updatedAt,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      userId: json['user_id'] as String,
      biometricEnabled: json['biometric_enabled'] as bool? ?? false,
      notificationsEnabled: json['notifications_enabled'] as bool? ?? true,
      defaultReminderTime: json['default_reminder_time'] as String?,
      theme: json['theme'] as String? ?? 'system',
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'biometric_enabled': biometricEnabled,
      'notifications_enabled': notificationsEnabled,
      if (defaultReminderTime != null) 'default_reminder_time': defaultReminderTime,
      'theme': theme,
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  UserSettings copyWith({
    String? userId,
    bool? biometricEnabled,
    bool? notificationsEnabled,
    String? defaultReminderTime,
    String? theme,
    DateTime? updatedAt,
  }) {
    return UserSettings(
      userId: userId ?? this.userId,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      defaultReminderTime: defaultReminderTime ?? this.defaultReminderTime,
      theme: theme ?? this.theme,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserSettings &&
        other.userId == userId &&
        other.biometricEnabled == biometricEnabled &&
        other.notificationsEnabled == notificationsEnabled &&
        other.defaultReminderTime == defaultReminderTime &&
        other.theme == theme &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      userId,
      biometricEnabled,
      notificationsEnabled,
      defaultReminderTime,
      theme,
      updatedAt,
    );
  }

  @override
  String toString() {
    return 'UserSettings(userId: $userId, biometricEnabled: $biometricEnabled, theme: $theme)';
  }
}