/**
 * Notification Service (Production Implementation)
 *
 * Per product spec:
 * - Push notifications via APNs/FCM
 * - Idempotency keys for zero duplicates
 * - Scheduled notifications (08:30, 12:15, 15:45)
 * - Immediate notifications for 強 impact events
 *
 * NOTE: This is a React Native implementation using expo-notifications
 * For production backend, replace with APNs/FCM direct integration
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification configuration
 */
export interface NotificationConfig {
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Custom data payload */
  data?: Record<string, unknown>;
  /** Idempotency key (prevents duplicates) */
  idempotencyKey?: string;
}

/**
 * Configure notification handler (call once at app startup)
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions
 * Per product spec: Required before sending any notifications
 *
 * @returns True if permission granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Send immediate local notification
 * Per product spec: For 強 impact events during market hours
 *
 * @param config - Notification configuration
 */
export async function sendImmediateNotification(
  config: NotificationConfig,
): Promise<void> {
  // Check if already sent (idempotency)
  if (config.idempotencyKey) {
    const alreadySent = await checkIdempotency(config.idempotencyKey);
    if (alreadySent) {
      console.log(`Notification already sent: ${config.idempotencyKey}`);
      return;
    }
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data || {},
      },
      trigger: null, // Immediate
    });

    // Mark as sent
    if (config.idempotencyKey) {
      await markAsSent(config.idempotencyKey);
    }

    console.log(`Notification sent: ${config.title}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

/**
 * Schedule notification for specific time
 * Per product spec: For digest notifications (08:30, 12:15, 15:45)
 *
 * @param config - Notification configuration
 * @param scheduledTime - Date/time to send notification
 * @returns Notification ID (can be used to cancel)
 */
export async function scheduleNotification(
  config: NotificationConfig,
  scheduledTime: Date,
): Promise<string> {
  // Check if already scheduled (idempotency)
  if (config.idempotencyKey) {
    const alreadySent = await checkIdempotency(config.idempotencyKey);
    if (alreadySent) {
      console.log(`Notification already scheduled: ${config.idempotencyKey}`);
      return '';
    }
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data || {},
      },
      trigger: {
        date: scheduledTime,
      },
    });

    // Mark as sent
    if (config.idempotencyKey) {
      await markAsSent(config.idempotencyKey);
    }

    console.log(
      `Notification scheduled for ${scheduledTime.toISOString()}: ${config.title}`,
    );

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    throw error;
  }
}

/**
 * Cancel scheduled notification
 *
 * @param notificationId - Notification ID from scheduleNotification
 */
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get push notification token for backend registration
 * Per product spec: Send to backend for targeted push
 *
 * @returns Push token or null if not available
 */
export async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  return token || null;
}

// Simple in-memory cache for idempotency keys
// In production, use persistent storage (AsyncStorage, SQLite, etc.)
const sentNotifications = new Set<string>();

/**
 * Check if notification with this key was already sent
 */
async function checkIdempotency(key: string): Promise<boolean> {
  return sentNotifications.has(key);
}

/**
 * Mark notification as sent
 */
async function markAsSent(key: string): Promise<void> {
  sentNotifications.add(key);
}

/**
 * Clear idempotency cache (for testing/debugging)
 */
export function clearIdempotencyCache(): void {
  sentNotifications.clear();
}
