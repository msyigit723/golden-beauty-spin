// API response types

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// JWT token payloads
export interface UserTokenPayload {
  userId: string;
  role: 'user';
  iat?: number;
  exp?: number;
}

export interface AdminTokenPayload {
  adminId: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export type TokenPayload = UserTokenPayload | AdminTokenPayload;

// Admin types
export interface Admin {
  id: string;
  username: string;
  createdAt: string;
}

export interface AdminRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}
