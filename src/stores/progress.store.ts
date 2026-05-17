import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { STORAGE_KEYS } from '@/constants/app.constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProgressState {
  /** courseId → array of completed lessonIds */
  completedLessons: Record<number, string[]>;
}

interface ProgressActions {
  markLessonComplete: (courseId: number, lessonId: string) => void;
  markLessonIncomplete: (courseId: number, lessonId: string) => void;
  reset: () => void;
}

const initialState: ProgressState = {
  completedLessons: {},
};

// Stable empty array — avoids creating new references in selectors
const EMPTY_ARRAY: string[] = [];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set) => ({
      ...initialState,

      markLessonComplete: (courseId, lessonId) => {
        set((s) => {
          const current = s.completedLessons[courseId] ?? EMPTY_ARRAY;
          if (current.includes(lessonId)) return s; // no-op if already complete
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseId]: [...current, lessonId],
            },
          };
        });
      },

      markLessonIncomplete: (courseId, lessonId) => {
        set((s) => {
          const current = s.completedLessons[courseId];
          if (!current || !current.includes(lessonId)) return s;
          return {
            completedLessons: {
              ...s.completedLessons,
              [courseId]: current.filter((id) => id !== lessonId),
            },
          };
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);

// ─── Pure Selectors (stable references — safe for React renders) ──────────────
// These are plain functions that take state and return values.
// They NEVER create new objects/arrays when data hasn't changed.

/** Get completed lesson IDs for a course. Returns stable empty array if none. */
export function selectCompletedLessonIds(state: ProgressState, courseId: number): string[] {
  return state.completedLessons[courseId] ?? EMPTY_ARRAY;
}

/** Check if a specific lesson is complete */
export function selectIsLessonComplete(state: ProgressState, courseId: number, lessonId: string): boolean {
  return (state.completedLessons[courseId] ?? EMPTY_ARRAY).includes(lessonId);
}

/** Get count of completed lessons for a course */
export function selectCompletedCount(state: ProgressState, courseId: number): number {
  return (state.completedLessons[courseId] ?? EMPTY_ARRAY).length;
}

/** Get progress percentage for a course */
export function selectCourseProgress(state: ProgressState, courseId: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  const completed = (state.completedLessons[courseId] ?? EMPTY_ARRAY).length;
  return Math.round((completed / totalLessons) * 100);
}
