export const API_BASE_URL = 'https://api.freeapi.app/api/v1';

export const ENDPOINTS = {
  // Auth
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  LOGOUT: '/users/logout',
  CURRENT_USER: '/users/current-user',
  REFRESH_TOKEN: '/users/refresh-token',
  // Public
  RANDOM_USERS: '/public/randomusers',
  RANDOM_PRODUCTS: '/public/randomproducts',
} as const;

export const API_CONFIG = {
  TIMEOUT_MS: 15_000,
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY_MS: 1_000,
  PAGE_LIMIT: 10,
} as const;
