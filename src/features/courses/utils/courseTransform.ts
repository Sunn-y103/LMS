import type { RawRandomProduct, RawRandomUser } from '@/types/api.types';
import type { Course, CourseLevel, Instructor, Chapter, Lesson, LessonType } from '@/types/domain.types';

const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['2h 30m', '4h 15m', '6h 00m', '8h 45m', '3h 20m', '5h 10m', '1h 50m'];

// ─── Chapter/Lesson Templates ─────────────────────────────────────────────────
// Generated deterministically from product id to ensure consistency across renders.

const CHAPTER_TEMPLATES: string[][] = [
  ['Getting Started', 'Core Fundamentals', 'Practical Applications', 'Advanced Techniques'],
  ['Introduction', 'Building Blocks', 'Deep Dive', 'Real-World Projects', 'Final Assessment'],
  ['Overview & Setup', 'Essential Concepts', 'Hands-On Practice', 'Expert Strategies'],
  ['Welcome & Orientation', 'Foundation Skills', 'Intermediate Mastery', 'Capstone Project'],
  ['Quick Start', 'Theory & Concepts', 'Workshop Sessions', 'Professional Tips', 'Wrap Up'],
];

const LESSON_TEMPLATES: Record<string, string[]> = {
  'Getting Started':        ['Welcome & Course Overview', 'Setting Up Your Environment', 'Your First Steps'],
  'Core Fundamentals':      ['Understanding the Basics', 'Key Principles Explained', 'Hands-On Exercise', 'Knowledge Check'],
  'Practical Applications': ['Building Your First Project', 'Common Patterns & Practices', 'Debugging & Troubleshooting'],
  'Advanced Techniques':    ['Performance Optimization', 'Scaling Strategies', 'Industry Best Practices', 'Final Project'],
  'Introduction':           ['What You Will Learn', 'Prerequisites & Tools', 'Course Roadmap'],
  'Building Blocks':        ['Fundamental Concept 1', 'Fundamental Concept 2', 'Practice Session'],
  'Deep Dive':              ['Advanced Topic Analysis', 'Case Study Walkthrough', 'Comparative Approaches', 'Interactive Lab'],
  'Real-World Projects':    ['Project Planning', 'Implementation Phase', 'Testing & Review'],
  'Final Assessment':       ['Review Session', 'Assessment Quiz', 'Next Steps'],
  'Overview & Setup':       ['Course Introduction', 'Tool Installation Guide', 'Environment Configuration'],
  'Essential Concepts':     ['Core Theory', 'Applied Examples', 'Practice Exercises', 'Concept Review'],
  'Hands-On Practice':      ['Guided Workshop', 'Solo Exercise', 'Peer Review Session'],
  'Expert Strategies':      ['Advanced Patterns', 'Optimization Tips', 'Career Guidance', 'Course Wrap-Up'],
  'Welcome & Orientation':  ['Meet Your Instructor', 'Learning Objectives', 'Community Guidelines'],
  'Foundation Skills':      ['Skill Building Exercise 1', 'Skill Building Exercise 2', 'Progress Check'],
  'Intermediate Mastery':   ['Complex Problem Solving', 'Collaborative Workshop', 'Mid-Course Assessment'],
  'Capstone Project':       ['Project Brief', 'Development Sprint', 'Presentation & Feedback', 'Certificate of Completion'],
  'Quick Start':            ['5-Minute Setup', 'Hello World Tutorial'],
  'Theory & Concepts':      ['Theoretical Framework', 'Concept Mapping', 'Discussion Points'],
  'Workshop Sessions':      ['Workshop 1: Basics', 'Workshop 2: Intermediate', 'Workshop 3: Advanced'],
  'Professional Tips':      ['Industry Insights', 'Portfolio Building', 'Interview Preparation'],
  'Wrap Up':                ['Course Summary', 'Resource Library', 'Farewell & Next Steps'],
};

const LESSON_TYPES: LessonType[] = ['video', 'video', 'video', 'reading', 'video', 'quiz'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function deriveLessonDuration(courseId: number, lessonIndex: number): string {
  const base = 4 + Math.floor(seededRandom(courseId * 100 + lessonIndex) * 18); // 4-22 minutes
  const secs = Math.floor(seededRandom(courseId * 200 + lessonIndex) * 59);
  return `${base}:${secs.toString().padStart(2, '0')}`;
}

function generateChapters(productId: number): Chapter[] {
  const templateIndex = productId % CHAPTER_TEMPLATES.length;
  const chapterTitles = CHAPTER_TEMPLATES[templateIndex];

  return chapterTitles.map((chapterTitle, chIdx) => {
    const lessonTitles = LESSON_TEMPLATES[chapterTitle] ?? ['Lesson 1', 'Lesson 2', 'Lesson 3'];
    const lessons: Lesson[] = lessonTitles.map((lessonTitle, lIdx) => ({
      id: `c${productId}-ch${chIdx}-l${lIdx}`,
      title: lessonTitle,
      duration: deriveLessonDuration(productId, chIdx * 10 + lIdx),
      type: LESSON_TYPES[(productId + chIdx + lIdx) % LESSON_TYPES.length],
    }));

    return {
      id: `c${productId}-ch${chIdx}`,
      title: chapterTitle,
      lessons,
    };
  });
}

function deriveLevel(id: number): CourseLevel {
  return LEVELS[id % LEVELS.length];
}

function deriveDuration(id: number): string {
  return DURATIONS[id % DURATIONS.length];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapUserToInstructor(user: RawRandomUser): Instructor {
  return {
    id: user.id,
    name: `${user.name.first} ${user.name.last}`,
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    avatar: user.picture.large,
    avatarThumb: user.picture.thumbnail,
    location: `${user.location.city}, ${user.location.country}`,
    country: user.location.country,
    gender: user.gender,
  };
}

export function mapProductToCourse(
  product: RawRandomProduct,
  instructor: Instructor,
): Course {
  const chapters = generateChapters(product.id);
  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: parseFloat(
      (product.price / (1 - product.discountPercentage / 100)).toFixed(2),
    ),
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    brand: product.brand,
    category: product.category,
    // The freeapi proxy returns dead DummyJSON v1 CDN URLs that 404.
    // If we detect the old format, fallback to a deterministic high-res placeholder
    // so images render reliably in the UI.
    thumbnail: product.thumbnail?.includes('cdn.dummyjson.com/product-images')
      ? `https://picsum.photos/seed/${product.id}/600/400`
      : product.thumbnail,
    images: product.images?.map((img, i) =>
      img.includes('cdn.dummyjson.com/product-images')
        ? `https://picsum.photos/seed/${product.id}_${i}/600/400`
        : img,
    ) || [],
    instructor,
    duration: deriveDuration(product.id),
    level: deriveLevel(product.id),
    chapters,
    totalLessons,
  };
}

export function zipCoursesWithInstructors(
  products: RawRandomProduct[],
  users: RawRandomUser[],
): Course[] {
  const instructors = users.map(mapUserToInstructor);
  return products.map((product, index) => {
    const instructor = instructors[index % instructors.length];
    return mapProductToCourse(product, instructor);
  });
}
