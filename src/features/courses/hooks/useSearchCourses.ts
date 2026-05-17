import { useMemo } from 'react';
import type { Course } from '@/types/domain.types';

export function useSearchCourses(courses: Course[], query: string): Course[] {
  return useMemo(() => {
    if (!query.trim()) return courses;
    const lower = query.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower) ||
        c.instructor.name.toLowerCase().includes(lower) ||
        c.brand.toLowerCase().includes(lower),
    );
  }, [courses, query]);
}
