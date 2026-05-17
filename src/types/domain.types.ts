// ─── Domain Models ─────────────────────────────────────────────────────────────

export interface Instructor {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  avatarThumb: string;
  location: string;
  country: string;
  gender: string;
}

export type LessonType = 'video' | 'reading' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  duration: string;   // "8:30"
  type: LessonType;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
  duration: string;      // derived total
  level: CourseLevel;    // derived
  chapters: Chapter[];   // generated lesson structure
  totalLessons: number;  // convenience count
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface OfflineAction {
  id: string;
  type: 'BOOKMARK_ADD' | 'BOOKMARK_REMOVE' | 'ENROLL';
  payload: Record<string, unknown>;
  timestamp: number;
}
