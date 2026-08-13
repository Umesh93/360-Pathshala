export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  schoolId: number;
  username: string;
  roles: string[];
}

export interface AuthUser {
  userId: number;
  schoolId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  roles: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
