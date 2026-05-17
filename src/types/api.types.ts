import type { AxiosError } from 'axios';

// ─── Discriminated Union for API Errors ───────────────────────────────────────
export type ApiError =
  | { kind: 'network'; message: string }
  | { kind: 'timeout'; message: string }
  | { kind: 'unauthorized'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'not_found'; message: string }
  | { kind: 'server'; status: number; message: string }
  | { kind: 'offline'; message: string }
  | { kind: 'unknown'; message: string; error: unknown };

// ─── Generic API Response Wrapper ─────────────────────────────────────────────
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ─── Paginated Data Wrapper ────────────────────────────────────────────────────
export interface PaginatedData<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}

// ─── Raw Random User (from /public/randomusers) ───────────────────────────────
export interface RawRandomUser {
  id: number;
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  email: string;
  login: {
    uuid: string;
    username: string;
  };
  dob: {
    date: string;
    age: number;
  };
  phone: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

// ─── Raw Random Product (from /public/randomproducts) ─────────────────────────
export interface RawRandomProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthLoginData {
  username: string;
  password: string;
}

export interface AuthRegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface RawUserProfile {
  _id: string;
  avatar?: { url?: string };
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: RawUserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Type guard for AxiosError ─────────────────────────────────────────────────
export function isAxiosError(err: unknown): err is AxiosError {
  return typeof err === 'object' && err !== null && (err as AxiosError).isAxiosError === true;
}
