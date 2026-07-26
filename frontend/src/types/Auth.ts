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
