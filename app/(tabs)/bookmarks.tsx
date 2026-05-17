import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { CourseCard } from '@/components/course/CourseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBookmarkStore } from '@/stores/bookmark.store';
import { useCourses } from '@/features/courses/hooks/useCourses';
import type { Course } from '@/types/domain.types';
import { useRouter } from 'expo-router';

function keyExtractor(c: Course) { return String(c.id); }

export default function BookmarksScreen() {
  const router = useRouter();
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);
  const { courses } = useCourses();

  const bookmarked = courses.filter((c) => bookmarkedIds.includes(c.id));

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Course>) => <CourseCard course={item} />,
    [],
  );

  return (
    <ScreenWrapper>
      <View className="flex-1">
        <View className="px-4 pt-6 pb-2">
          <Text className="text-slate-100 text-2xl font-bold">Bookmarks</Text>
          <Text className="text-slate-400 text-sm mt-1">
            {bookmarked.length} saved {bookmarked.length === 1 ? 'course' : 'courses'}
          </Text>
        </View>

        {bookmarked.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No bookmarks yet"
            subtitle="Tap the bookmark icon on any course to save it here."
            actionLabel="Explore Courses"
            onAction={() => router.push('/(tabs)/home')}
          />
        ) : (
          <LegendList
            data={bookmarked}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={320}
            recycleItems
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
