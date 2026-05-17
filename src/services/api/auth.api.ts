import { apiClient, storeTokens } from './client';
import { ENDPOINTS } from '@/constants/api.constants';
import type {
  ApiResponse,
  AuthLoginData,
  AuthRegisterData,
  LoginResponse,
  RawUserProfile,
  RefreshTokenResponse,
} from '@/types/api.types';

export async function loginUser(data: AuthLoginData): Promise<LoginResponse> {
  const resp = await apiClient.post<ApiResponse<LoginResponse>>(ENDPOINTS.LOGIN, data);
  const { accessToken, refreshToken } = resp.data.data;
  await storeTokens(accessToken, refreshToken);
  return resp.data.data;
}

export async function registerUser(data: AuthRegisterData): Promise<RawUserProfile> {
  const resp = await apiClient.post<ApiResponse<{ user: RawUserProfile }>>(
    ENDPOINTS.REGISTER,
    data,
  );
  return resp.data.data.user;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post(ENDPOINTS.LOGOUT);
}

export async function getCurrentUser(): Promise<RawUserProfile> {
  const resp = await apiClient.get<ApiResponse<RawUserProfile>>(ENDPOINTS.CURRENT_USER);
  return resp.data.data;
}

export async function refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
  const resp = await apiClient.post<ApiResponse<RefreshTokenResponse>>(ENDPOINTS.REFRESH_TOKEN, {
    refreshToken,
  });
  return resp.data.data;
}
