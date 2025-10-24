/**
 * Scheduler Service
 *
 * Per product spec:
 * - Schedule notifications at 08:30, 12:15, 15:45 (JST)
 * - User can enable/disable each time slot
 * - Handles timezone (Asia/Tokyo)
 */

/**
 * Scheduled notification time slots
 * Per product spec: 08:30 (morning), 12:15 (midday), 15:45 (closing)
 */
export interface ScheduleConfig {
  /** Enable 08:30 morning digest */
  morning: boolean;
  /** Enable 12:15 midday digest */
  midday: boolean;
  /** Enable 15:45 closing digest */
  closing: boolean;
  /** Timezone (default: Asia/Tokyo) */
  timezone: string;
}

/**
 * Scheduled time configuration
 */
export interface ScheduledTime {
  /** Time slot identifier */
  id: 'morning' | 'midday' | 'closing';
  /** Display label */
  label: string;
  /** Hour (24h format) */
  hour: number;
  /** Minute */
  minute: number;
  /** Whether this slot is enabled */
  enabled: boolean;
}

/**
 * Default schedule configuration
 * Per product spec: 08:30, 12:15, 15:45 in JST
 */
export const DEFAULT_SCHEDULE: ScheduledTime[] = [
  {
    id: 'morning',
    label: '朝のダイジェスト',
    hour: 8,
    minute: 30,
    enabled: true,
  },
  {
    id: 'midday',
    label: '昼のダイジェスト',
    hour: 12,
    minute: 15,
    enabled: true,
  },
  {
    id: 'closing',
    label: '引け後のダイジェスト',
    hour: 15,
    minute: 45,
    enabled: true,
  },
];

/**
 * Calculate next scheduled time for a given slot
 *
 * @param slot - Schedule time configuration
 * @param timezone - Timezone (default: Asia/Tokyo)
 * @returns Next scheduled Date
 */
export function getNextScheduledTime(
  slot: ScheduledTime,
  timezone = 'Asia/Tokyo',
): Date {
  const now = new Date();

  // Get current time in target timezone
  const targetTime = new Date(
    now.toLocaleString('en-US', { timeZone: timezone }),
  );

  // Set time to scheduled hour and minute
  const scheduled = new Date(targetTime);
  scheduled.setHours(slot.hour, slot.minute, 0, 0);

  // If scheduled time has passed today, schedule for tomorrow
  if (scheduled <= targetTime) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled;
}

/**
 * Calculate milliseconds until next scheduled time
 *
 * @param slot - Schedule time configuration
 * @param timezone - Timezone (default: Asia/Tokyo)
 * @returns Milliseconds until next occurrence
 */
export function getMillisecondsUntilNext(
  slot: ScheduledTime,
  timezone = 'Asia/Tokyo',
): number {
  const next = getNextScheduledTime(slot, timezone);
  const now = new Date();
  return next.getTime() - now.getTime();
}

/**
 * Check if current time matches scheduled time (within 1-minute window)
 *
 * @param slot - Schedule time configuration
 * @param timezone - Timezone (default: Asia/Tokyo)
 * @returns True if current time matches schedule
 */
export function isScheduledTime(
  slot: ScheduledTime,
  timezone = 'Asia/Tokyo',
): boolean {
  const now = new Date();
  const targetTime = new Date(
    now.toLocaleString('en-US', { timeZone: timezone }),
  );

  const currentHour = targetTime.getHours();
  const currentMinute = targetTime.getMinutes();

  return currentHour === slot.hour && currentMinute === slot.minute;
}

/**
 * Start scheduled notification loop
 * Checks every minute if it's time to send scheduled notifications
 *
 * @param config - Schedule configuration
 * @param onSchedule - Callback invoked when scheduled time is reached
 * @returns Stop function to halt the loop
 */
export function startScheduleLoop(
  config: ScheduleConfig,
  onSchedule: (slotId: 'morning' | 'midday' | 'closing') => void,
): () => void {
  let running = true;
  const lastTriggered = new Map<string, number>();

  const checkSchedule = () => {
    if (!running) return;

    const now = Date.now();

    for (const slot of DEFAULT_SCHEDULE) {
      // Skip if slot is disabled
      const isEnabled = config[slot.id];
      if (!isEnabled) continue;

      // Check if it's time for this slot
      if (isScheduledTime(slot, config.timezone)) {
        // Prevent duplicate triggers within same minute
        const lastTime = lastTriggered.get(slot.id) || 0;
        if (now - lastTime < 60000) continue;

        // Trigger callback
        lastTriggered.set(slot.id, now);
        onSchedule(slot.id);
      }
    }
  };

  // Check every 30 seconds (more frequent than 1 minute to avoid missing)
  const intervalId = setInterval(checkSchedule, 30000);

  // Also check immediately
  checkSchedule();

  // Return stop function
  return () => {
    running = false;
    clearInterval(intervalId);
  };
}

/**
 * Schedule a one-time notification
 * Uses setTimeout for precise scheduling
 *
 * @param slot - Schedule time configuration
 * @param callback - Function to call at scheduled time
 * @param timezone - Timezone (default: Asia/Tokyo)
 * @returns Cancel function
 */
export function scheduleOnce(
  slot: ScheduledTime,
  callback: () => void,
  timezone = 'Asia/Tokyo',
): () => void {
  const ms = getMillisecondsUntilNext(slot, timezone);

  const timeoutId = setTimeout(callback, ms);

  return () => clearTimeout(timeoutId);
}

/**
 * Get human-readable time string for schedule slot
 *
 * @param slot - Schedule time configuration
 * @returns Formatted time string (e.g., "08:30")
 */
export function formatScheduleTime(slot: ScheduledTime): string {
  const hour = slot.hour.toString().padStart(2, '0');
  const minute = slot.minute.toString().padStart(2, '0');
  return `${hour}:${minute}`;
}
