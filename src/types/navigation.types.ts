import type { Course } from './domain.types';

// ─── Route Params ──────────────────────────────────────────────────────────────
export interface CourseDetailParams {
  id: string;
}

export interface CourseWebViewParams {
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  category: string;
  price: string;
  rating: string;
  lessonId: string;
  lessonTitle: string;
  chapterTitle: string;
}

// ─── Typed Search Params Helper ────────────────────────────────────────────────
export type CourseWebViewRouteParams = {
  [K in keyof CourseWebViewParams]: string;
};

// ─── Utility: pick course fields needed for WebView ────────────────────────────
export function toCourseWebViewParams(
  course: Course,
  lessonId: string,
  lessonTitle: string,
  chapterTitle: string,
): CourseWebViewParams {
  return {
    courseId: String(course.id),
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    instructorName: course.instructor.name,
    category: course.category,
    price: String(course.price),
    rating: String(course.rating),
    lessonId,
    lessonTitle,
    chapterTitle,
  };
}
