export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roles: string[];
  tenantId: string;
  isSuperAdmin: boolean;
}

export interface LoginResponse {
  user: User;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}