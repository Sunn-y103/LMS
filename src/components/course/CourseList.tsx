import React, { useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list';
import { CourseCard } from './CourseCard';
import { CourseListSkeletons } from './CourseCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Course } from '@/types/domain.types';
import { COLORS } from '@/theme/colors';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  searchQuery?: string;
  ListHeaderComponent?: React.ReactElement;
}

function keyExtractor(course: Course): string {
  return String(course.id);
}

export function CourseList({
  courses,
  isLoading,
  isFetchingNextPage,
  isRefreshing,
  hasNextPage,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
}: CourseListProps) {
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Course>) => <CourseCard course={item} />,
    [],
  );

  const ListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return <CourseListSkeletons count={4} />;
    return (
      <EmptyState
        icon="🔍"
        title="No courses found"
        subtitle="Try a different search term or check back later."
      />
    );
  }, [isLoading]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) onEndReached();
  }, [hasNextPage, isFetchingNextPage, onEndReached]);

  return (
    <LegendList
      data={courses}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={320}
      recycleItems
      drawDistance={500}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<ListFooter />}
      ListEmptyComponent={<ListEmpty />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
