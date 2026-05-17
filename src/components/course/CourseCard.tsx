import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useBookmarkStore } from '@/stores/bookmark.store';
import { useEnrollmentStore } from '@/stores/enrollment.store';
import { useProgressStore, selectCompletedCount } from '@/stores/progress.store';
import type { Course } from '@/types/domain.types';

const THUMBNAIL_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = React.memo(function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const isBookmarked = useBookmarkStore((s) => s.bookmarkedIds.includes(course.id));
  const isEnrolled = useEnrollmentStore((s) => s.enrolledIds.includes(course.id));

  // Stable selector — selectCompletedCount returns a primitive number, no new references
  const completedCount = useProgressStore((s) => selectCompletedCount(s, course.id));
  const progressPct = course.totalLessons > 0
    ? Math.round((completedCount / course.totalLessons) * 100)
    : 0;

  const handlePress = useCallback(() => {
    router.push(`/course/${course.id}`);
  }, [course.id, router]);

  const handleBookmark = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      toggleBookmark(course.id);
    },
    [course.id, toggleBookmark],
  );

  // Use thumbnail, fallback to first image in images[]
  const imageUri = course.thumbnail || (course.images.length > 0 ? course.images[0] : '');

  return (
    <Pressable
      onPress={handlePress}
      className="bg-slate-900 rounded-2xl border border-slate-800 mb-4 overflow-hidden active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Course: ${course.title}`}
    >
      {/* Thumbnail */}
      <View className="relative" style={{ backgroundColor: '#1A2236' }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            placeholder={{ blurhash: THUMBNAIL_BLURHASH }}
            placeholderContentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            recyclingKey={`course-thumb-${course.id}`}
            priority={course.id <= 4 ? 'high' : 'normal'}
          />
        ) : (
          <View style={{ width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-4xl">📚</Text>
          </View>
        )}

        {/* Bookmark button */}
        <Pressable
          onPress={handleBookmark}
          className="absolute top-3 right-3 bg-slate-900/80 rounded-full w-9 h-9 items-center justify-center"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          hitSlop={8}
        >
          <Text className="text-lg">{isBookmarked ? '🔖' : '🏷️'}</Text>
        </Pressable>

        {/* Enrolled / Progress badge */}
        {isEnrolled && (
          <View className="absolute top-3 left-3 bg-green-600/90 rounded-full px-2.5 py-1 flex-row items-center">
            <Text className="text-white text-xs font-semibold">
              {progressPct === 100 ? '✓ Complete' : `${completedCount}/${course.totalLessons} lessons`}
            </Text>
          </View>
        )}

        {/* Progress bar overlay at bottom of thumbnail */}
        {isEnrolled && progressPct > 0 && (
          <View className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60">
            <View
              className="h-1 bg-green-500"
              style={{ width: `${progressPct}%` }}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Instructor row */}
        <View className="flex-row items-center mb-3">
          <Avatar uri={course.instructor.avatarThumb} size="xs" />
          <Text className="text-slate-400 text-xs ml-2 flex-1" numberOfLines={1}>
            {course.instructor.name}
          </Text>
          <Badge label={course.level} variant="primary" />
        </View>

        {/* Title */}
        <Text className="text-slate-100 text-base font-bold mb-1.5" numberOfLines={2}>
          {course.title}
        </Text>

        {/* Description */}
        <Text className="text-slate-400 text-sm leading-5 mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-amber-400 text-sm mr-1">⭐</Text>
            <Text className="text-slate-300 text-sm font-medium">{course.rating.toFixed(1)}</Text>
            <Text className="text-slate-600 mx-1.5">·</Text>
            <Text className="text-slate-500 text-xs">{course.totalLessons} lessons</Text>
            <Text className="text-slate-600 mx-1.5">·</Text>
            <Text className="text-slate-500 text-xs">{course.duration}</Text>
          </View>
          <Text className="text-brand-400 text-base font-bold">${course.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}, (prev, next) => prev.course.id === next.course.id);
