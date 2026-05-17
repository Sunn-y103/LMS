import { apiClient } from './client';
import { ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse, PaginatedData, RawRandomUser } from '@/types/api.types';

export async function fetchInstructors(params: {
  page: number;
  limit?: number;
}): Promise<PaginatedData<RawRandomUser>> {
  const resp = await apiClient.get<ApiResponse<PaginatedData<RawRandomUser>>>(
    ENDPOINTS.RANDOM_USERS,
    { params: { page: params.page, limit: params.limit ?? 100 } },
  );
  return resp.data.data;
}
