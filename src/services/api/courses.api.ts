import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse, PaginatedData, RawRandomProduct } from '@/types/api.types';

export interface FetchCoursesParams {
  page: number;
  limit?: number;
}

export async function fetchProducts(params: FetchCoursesParams): Promise<PaginatedData<RawRandomProduct>> {
  const resp = await apiClient.get<ApiResponse<PaginatedData<RawRandomProduct>>>(
    ENDPOINTS.RANDOM_PRODUCTS,
    { params: { page: params.page, limit: params.limit ?? 10 } },
  );
  return resp.data.data;
}
