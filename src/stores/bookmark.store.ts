import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { STORAGE_KEYS } from '@/constants/app.constants';
import { scheduleBookmarkMilestone } from '@/services/notifications/notification.service';

interface BookmarkState {
  bookmarkedIds: number[];
}

interface BookmarkActions {
  toggleBookmark: (courseId: number) => void;
  isBookmarked: (courseId: number) => boolean;
  getCount: () => number;
  reset: () => void;
}

const initialState: BookmarkState = {
  bookmarkedIds: [],
};

export const useBookmarkStore = create<BookmarkState & BookmarkActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleBookmark: (courseId) => {
        const current = get().bookmarkedIds;
        const isAlready = current.includes(courseId);
        const next = isAlready
          ? current.filter((id) => id !== courseId)
          : [...current, courseId];
        set({ bookmarkedIds: next });

        // Trigger milestone notification when adding
        if (!isAlready) {
          scheduleBookmarkMilestone(next.length).catch(() => undefined);
        }
      },

      isBookmarked: (courseId) => get().bookmarkedIds.includes(courseId),
      getCount: () => get().bookmarkedIds.length,
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.BOOKMARKS,
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectBookmarkedIds = (s: BookmarkState) => s.bookmarkedIds;
export const selectBookmarkCount = (s: BookmarkState & BookmarkActions) => s.bookmarkedIds.length;
