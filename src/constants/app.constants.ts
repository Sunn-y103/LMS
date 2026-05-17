// ─── Storage Keys ─────────────────────────────────────────────────────────────
// AUTH_SESSION is stored in SecureStore (global — identifies who is logged in).
// All other keys are base names for user-scoped AsyncStorage.
// The userScopedStorage adapter appends `-${userId}` automatically.
// e.g. "bookmarks" → "bookmarks-abc123"
export const STORAGE_KEYS = {
  AUTH_SESSION: 'learnhub_auth_session',
  BOOKMARKS: 'bookmarks',
  ENROLLMENTS: 'enrollments',
  PREFERENCES: 'preferences',
  ACTIVITY: 'activity',
  PROGRESS: 'progress',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  INSTRUCTOR_LIMIT: 100,
} as const;

export const DEBOUNCE_DELAY_MS = 400;

export const NOTIFICATION_CHANNEL_ID = 'learnhub-default';
export const BOOKMARK_MILESTONE_INTERVAL = 5;
export const INACTIVITY_REMINDER_HOURS = 24;

export const APP_NAME = 'LearnHub';
export const APP_VERSION = '1.0.0';
