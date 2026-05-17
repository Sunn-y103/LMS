import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';
import { STORAGE_KEYS } from '@/constants/app.constants';

interface EnrollmentState {
  enrolledIds: number[];
}

interface EnrollmentActions {
  enroll: (courseId: number) => void;
  unenroll: (courseId: number) => void;
  isEnrolled: (courseId: number) => boolean;
  getCount: () => number;
  reset: () => void;
}

const initialState: EnrollmentState = {
  enrolledIds: [],
};

export const useEnrollmentStore = create<EnrollmentState & EnrollmentActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      enroll: (courseId) => {
        if (!get().enrolledIds.includes(courseId)) {
          set((s) => ({ enrolledIds: [...s.enrolledIds, courseId] }));
        }
      },
      unenroll: (courseId) =>
        set((s) => ({ enrolledIds: s.enrolledIds.filter((id) => id !== courseId) })),
      isEnrolled: (courseId) => get().enrolledIds.includes(courseId),
      getCount: () => get().enrolledIds.length,
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.ENROLLMENTS,
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectEnrolledIds = (s: EnrollmentState) => s.enrolledIds;
export const selectEnrollmentCount = (s: EnrollmentState) => s.enrolledIds.length;
