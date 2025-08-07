import 'package:intl/intl.dart';

class DateHelpers {
  // Get today's date in local timezone as YYYY-MM-DD string
  static String getTodayLocalDate() {
    final now = DateTime.now();
    return DateFormat('yyyy-MM-dd').format(now);
  }

  // Get date string in local timezone
  static String getLocalDateString(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  // Format date for storage (same as getLocalDateString, kept for compatibility)
  static String formatDateForStorage(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  // Parse date string to DateTime
  static DateTime parseLocalDate(String dateString) {
    return DateFormat('yyyy-MM-dd').parse(dateString);
  }

  // Get formatted date for display (e.g., "Today", "Yesterday", "Jan 15")
  static String getDisplayDate(String dateString) {
    final date = parseLocalDate(dateString);
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  // Check if two dates are the same day
  static bool isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
           date1.month == date2.month &&
           date1.day == date2.day;
  }

  // Get the start of the week (Monday)
  static DateTime getStartOfWeek(DateTime date) {
    final weekday = date.weekday;
    return date.subtract(Duration(days: weekday - 1));
  }

  // Get the start of the month
  static DateTime getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1);
  }

  // Get the end of the month
  static DateTime getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 1).subtract(const Duration(days: 1));
  }

  // Get days in month
  static int getDaysInMonth(int year, int month) {
    return DateTime(year, month + 1, 0).day;
  }

  // Get days passed in current month
  static int getDaysPassedInMonth([DateTime? date]) {
    final targetDate = date ?? DateTime.now();
    return targetDate.day;
  }

  // Get days remaining in current month
  static int getDaysRemainingInMonth([DateTime? date]) {
    final targetDate = date ?? DateTime.now();
    final daysInMonth = getDaysInMonth(targetDate.year, targetDate.month);
    return daysInMonth - targetDate.day;
  }

  // Get week dates (Monday to Sunday)
  static List<DateTime> getWeekDates(DateTime date) {
    final startOfWeek = getStartOfWeek(date);
    return List.generate(7, (index) => startOfWeek.add(Duration(days: index)));
  }

  // Get month dates for calendar view
  static List<DateTime> getMonthDates(int year, int month) {
    final firstDay = DateTime(year, month, 1);
    final lastDay = getEndOfMonth(firstDay);
    final daysInMonth = lastDay.day;
    
    return List.generate(daysInMonth, (index) => DateTime(year, month, index + 1));
  }

  // Get calendar grid (including previous/next month days for full weeks)
  static List<DateTime> getCalendarGrid(int year, int month) {
    final firstDay = DateTime(year, month, 1);
    
    // Start from Monday of the week containing the first day
    final startDate = getStartOfWeek(firstDay);
    
    // Generate 6 weeks = 42 days
    return List.generate(42, (index) => startDate.add(Duration(days: index)));
  }

  // Format time for display
  static String formatTime(DateTime dateTime) {
    return DateFormat('h:mm a').format(dateTime);
  }

  // Format date and time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM d, yyyy h:mm a').format(dateTime);
  }

  // Get relative time string (e.g., "2 hours ago")
  static String getRelativeTimeString(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d').format(dateTime);
    }
  }

  // Get streak between two dates
  static int getStreakDays(DateTime startDate, DateTime endDate) {
    return endDate.difference(startDate).inDays + 1;
  }

  // Check if date is today
  static bool isToday(String dateString) {
    return dateString == getTodayLocalDate();
  }

  // Check if date is in current week
  static bool isInCurrentWeek(String dateString) {
    final date = parseLocalDate(dateString);
    final today = DateTime.now();
    final startOfWeek = getStartOfWeek(today);
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    
    return date.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
           date.isBefore(endOfWeek.add(const Duration(days: 1)));
  }

  // Check if date is in current month
  static bool isInCurrentMonth(String dateString) {
    final date = parseLocalDate(dateString);
    final today = DateTime.now();
    
    return date.year == today.year && date.month == today.month;
  }

  // Get month name
  static String getMonthName(int month) {
    return DateFormat('MMMM').format(DateTime(2023, month));
  }

  // Get short month name
  static String getShortMonthName(int month) {
    return DateFormat('MMM').format(DateTime(2023, month));
  }

  // Get weekday name
  static String getWeekdayName(int weekday) {
    return DateFormat('EEEE').format(DateTime(2023, 1, weekday + 1));
  }

  // Get short weekday name
  static String getShortWeekdayName(int weekday) {
    return DateFormat('EEE').format(DateTime(2023, 1, weekday + 1));
  }
}