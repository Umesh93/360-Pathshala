import api from "./api";
import axios from "axios";
import type {
  AuthUser,
  ChangePasswordRequest,
  LoginResponse,
} from "../types/Auth";

export const login = async (
  usernameOrEmail: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", {
    usernameOrEmail,
    password,
  });
  const data = response.data;
  return {
    token: data.token,
    userId: data.userId,
    schoolId: data.schoolId,
    username: data.username,
    roles: data.roles || [],
  };
};

export const authError = (
  error: unknown,
  fallback = "Request failed. Please try again.",
): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const data = error.response?.data as
    | { message?: string; error?: string; errors?: Record<string, string> }
    | string
    | undefined;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const fieldError = data.errors && Object.values(data.errors)[0];
    if (fieldError) return fieldError;
    return data.message ?? data.error ?? error.message ?? fallback;
  }
  return error.message || fallback;
};

export const getCurrentUser = async (): Promise<AuthUser> =>
  (await api.get<AuthUser>("/auth/me")).data;

export const updateCurrentUser = async (fullName: string): Promise<AuthUser> =>
  (await api.patch<AuthUser>("/auth/me", { fullName })).data;

export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await api.post("/auth/me/change-password", request);
};

export const requestPasswordReset = async (email: string): Promise<string> =>
  (await api.post<{ message: string }>("/auth/forgot-password", { email })).data
    .message;

export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<string> =>
  (
    await api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    })
  ).data.message;
