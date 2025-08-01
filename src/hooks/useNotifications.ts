import { useState, useEffect, useCallback } from 'react';
import { notificationService, type HabitNotification } from '../services/notifications';

export interface UseNotificationsReturn {
  permissionGranted: boolean;
  isLoading: boolean;
  requestPermissions: () => Promise<boolean>;
  scheduleHabitReminder: (notification: HabitNotification) => Promise<string | null>;
  cancelHabitNotifications: (habitId: string) => Promise<void>;
  updateHabitReminder: (notification: HabitNotification) => Promise<string | null>;
  getScheduledNotifications: () => Promise<any[]>;
  cancelAllNotifications: () => Promise<void>;
  cleanupNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial permission status
  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      try {
        const hasPermission = await notificationService.areNotificationsEnabled();
        setPermissionGranted(hasPermission);
      } catch (error) {
        console.error('Error checking notification permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
    
    // Set up notification response listener
    notificationService.setupNotificationResponseListener();
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleHabitReminder = useCallback(async (notification: HabitNotification): Promise<string | null> => {
    if (!permissionGranted) {
      console.warn('Cannot schedule notification: permission not granted');
      return null;
    }
    return await notificationService.scheduleHabitReminder(notification);
  }, [permissionGranted]);

  const cancelHabitNotifications = useCallback(async (habitId: string): Promise<void> => {
    await notificationService.cancelHabitNotifications(habitId);
  }, []);

  const updateHabitReminder = useCallback(async (notification: HabitNotification): Promise<string | null> => {
    if (!permissionGranted) {
      console.warn('Cannot update notification: permission not granted');
      return null;
    }
    return await notificationService.updateHabitReminder(notification);
  }, [permissionGranted]);

  const getScheduledNotifications = useCallback(async () => {
    return await notificationService.getScheduledNotifications();
  }, []);

  const cleanupNotifications = useCallback(async (): Promise<void> => {
    await notificationService.cleanupNotifications();
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    await notificationService.cancelAllNotifications();
  }, []);

  return {
    permissionGranted,
    isLoading,
    requestPermissions,
    scheduleHabitReminder,
    cancelHabitNotifications,
    updateHabitReminder,
    getScheduledNotifications,
    cancelAllNotifications,
    cleanupNotifications,
  };
}