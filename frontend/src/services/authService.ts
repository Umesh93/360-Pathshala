import api from "./api";
import type { LoginResponse } from "../types/Auth";

export const login = async (
  usernameOrEmail: string,
  password: string,
): Promise<LoginResponse> => {
  console.log("AuthService: attempting login to", "/auth/login", {
    usernameOrEmail,
  });
  const response = await api.post("/auth/login", {
    usernameOrEmail,
    password,
  });
  console.log("AuthService: login response", response.data);
  const data = response.data;
  return {
    token: data.token,
    userId: data.userId,
    schoolId: data.schoolId,
    username: data.username,
    roles: data.roles || [],
  };
};
