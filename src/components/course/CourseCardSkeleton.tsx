import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';

export function CourseCardSkeleton() {
  return (
    <View className="bg-slate-900 rounded-2xl border border-slate-800 mb-4 overflow-hidden">
      <Skeleton height={180} borderRadius={0} />
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Skeleton width={28} height={28} borderRadius={14} />
          <View className="flex-1 ml-2">
            <Skeleton height={12} width="40%" />
          </View>
        </View>
        <Skeleton height={18} className="mb-2" />
        <Skeleton height={14} className="mb-1.5" />
        <Skeleton height={14} width="75%" className="mb-4" />
        <View className="flex-row justify-between">
          <Skeleton height={14} width={80} />
          <Skeleton height={18} width={50} />
        </View>
      </View>
    </View>
  );
}

export function CourseListSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </>
  );
}
