/**
 * Schedule notifications for stock price updates at specific times.
 * This is a placeholder implementation. In a future phase you should integrate with Expo's Notifications API
 * and handle device permissions. Right now this function logs a warning.
 *
 * @param time ISO 8601 time string e.g., '09:15', '12:15', '15:45'
 * @param message Notification message to display.
 */
export async function scheduleNotification(
  time: string,
  message: string,
): Promise<void> {
  console.warn(
    `scheduleNotification called with time ${time} and message ${message}. This is a stub implementation; implement scheduling logic later.`,
  );
}
