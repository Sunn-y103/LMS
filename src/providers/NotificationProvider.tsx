import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  setupNotificationChannel,
  requestNotificationPermissions,
  scheduleInactivityReminder,
} from '@/services/notifications/notification.service';
import { usePreferencesStore } from '@/stores/preferences.store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const { notificationsEnabled, updateLastOpenedAt } = usePreferencesStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      await setupNotificationChannel();
      if (notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleInactivityReminder();
        }
      }
      updateLastOpenedAt();
    }

    init().catch(() => undefined);

    const responseListener = Notifications.addNotificationResponseReceivedListener(() => {
      // Navigate based on notification data if needed
    });

    return () => responseListener.remove();
  }, [notificationsEnabled, updateLastOpenedAt]);

  return <>{children}</>;
}
