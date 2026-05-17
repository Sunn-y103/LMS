import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  NOTIFICATION_CHANNEL_ID,
  BOOKMARK_MILESTONE_INTERVAL,
  INACTIVITY_REMINDER_HOURS,
} from '@/constants/app.constants';

// ─── Android Channel Setup ────────────────────────────────────────────────────
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'LearnHub Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
}

// ─── Permission Request ───────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Bookmark Milestone ───────────────────────────────────────────────────────
export async function scheduleBookmarkMilestone(count: number): Promise<void> {
  if (count % BOOKMARK_MILESTONE_INTERVAL !== 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Milestone Reached!',
      body: `You've bookmarked ${count} courses. Keep exploring!`,
      data: { type: 'bookmark_milestone', count },
    },
    trigger: null, // immediate
  });
}

// ─── Inactivity Reminder ──────────────────────────────────────────────────────
export async function scheduleInactivityReminder(): Promise<void> {
  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 Ready to learn?',
      body: "You haven't opened LearnHub in a while. Your courses are waiting!",
      data: { type: 'inactivity_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: INACTIVITY_REMINDER_HOURS * 60 * 60,
      repeats: false,
    },
  });
}

// ─── Cancel All ──────────────────────────────────────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
