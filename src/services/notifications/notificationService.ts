import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface HabitNotification {
  habitId: string;
  habitName: string;
  reminderTime: string; // HH:MM format
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  motivationalMessage?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  weekendReminders: boolean;
  notificationStyle: 'minimal' | 'detailed' | 'motivational';
}

class NotificationService {
  private static instance: NotificationService;
  private permissionGranted: boolean = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B7355', // Our primary earth tone color
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionGranted = finalStatus === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Schedule a daily habit reminder notification
   */
  async scheduleHabitReminder(notification: HabitNotification): Promise<string | null> {
    if (!this.permissionGranted) {
      console.warn('Notification permissions not granted');
      return null;
    }

    try {
      const timeParts = notification.reminderTime.split(':');
      if (timeParts.length !== 2) {
        throw new Error('Invalid time format');
      }
      
      const hours = parseInt(timeParts[0]!, 10);
      const minutes = parseInt(timeParts[1]!, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time format');
      }
      
      const trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const content: Notifications.NotificationContentInput = {
        title: '🌱 Habit Reminder',
        body: this.generateNotificationMessage(notification),
        data: {
          habitId: notification.habitId,
          type: 'habit-reminder',
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        color: '#8B7355', // Primary earth tone
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: trigger as any, // Type assertion for Expo Notifications compatibility
      });

      console.log(`Scheduled notification for habit: ${notification.habitName} at ${notification.reminderTime}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
      return null;
    }
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all notifications for a specific habit
   */
  async cancelHabitNotifications(habitId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const habitNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.['habitId'] === habitId
      );

      for (const notification of habitNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${habitNotifications.length} notifications for habit: ${habitId}`);
    } catch (error) {
      console.error('Error cancelling habit notifications:', error);
    }
  }

  /**
   * Update a habit's notification schedule
   */
  async updateHabitReminder(notification: HabitNotification): Promise<string | null> {
    // Cancel existing notifications for this habit
    await this.cancelHabitNotifications(notification.habitId);
    
    // Schedule new notification
    return await this.scheduleHabitReminder(notification);
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Generate motivational notification messages
   */
  private generateNotificationMessage(notification: HabitNotification): string {
    const messages = {
      minimal: `Time for ${notification.habitName}`,
      detailed: `🎯 Ready to build your ${notification.habitName} habit? Small actions lead to big changes!`,
      motivational: this.getMotivationalMessage(notification.habitName),
    };

    // Default to minimal for now - this could be configurable per user
    return messages.minimal;
  }

  /**
   * Generate motivational messages based on habit type
   */
  private getMotivationalMessage(habitName: string): string {
    const motivationalMessages = [
      `🌟 Time for ${habitName}! Every small step counts toward your bigger goals.`,
      `💪 Ready for ${habitName}? You're building the person you want to become!`,
      `🔥 ${habitName} time! Consistency is the key to lasting change.`,
      `✨ Let's do ${habitName}! Your future self will thank you for this moment.`,
      `🎯 ${habitName} reminder: You're just one action away from progress!`,
      `🌱 Time for ${habitName}! Small habits, big transformations.`,
      `⚡ ${habitName} break! You've got this - one day at a time!`,
      `🏆 Ready for ${habitName}? Champions are made through daily habits.`,
    ];

    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex] ?? `Time for ${habitName}! You've got this! 💪`;
  }

  /**
   * Handle notification responses (when user taps notification)
   */
  setupNotificationResponseListener(): void {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.['type'] === 'habit-reminder' && data?.['habitId']) {
        console.log(`User tapped notification for habit: ${data['habitId']}`);
        // Here you could navigate to the specific habit or mark it as completed
        // This would integrate with your navigation system
      }
    });
  }

  /**
   * Clean up old/completed notifications
   */
  async cleanupNotifications(): Promise<void> {
    try {
      // Remove delivered notifications from notification center
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();