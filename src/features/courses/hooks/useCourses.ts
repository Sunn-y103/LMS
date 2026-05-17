import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts } from '@/services/api/courses.api';
import { fetchInstructors } from '@/services/api/instructors.api';
import { zipCoursesWithInstructors } from '../utils/courseTransform';
import type { Course } from '@/types/domain.types';

const QUERY_KEY = ['courses'] as const;

export function useCourses() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: QUERY_KEY,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const [products, users] = await Promise.all([
        fetchProducts({ page, limit: 10 }),
        fetchInstructors({ page: 1, limit: 100 }),
      ]);
      return {
        courses: zipCoursesWithInstructors(products.data, users.data),
        nextPage: products.nextPage ? page + 1 : undefined,
        totalPages: products.totalPages,
        page,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const allCourses: Course[] = query.data?.pages.flatMap((p) => p.courses) ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  return {
    courses: allCourses,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    invalidate,
  };
}

export { QUERY_KEY as COURSES_QUERY_KEY };
