export interface JwtPayload {
  sub: string;
  userId: number;
  schoolId?: number;
  roles: string[];
  iat: number;
  exp: number;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const getTokenRemainingSeconds = (token: string): number => {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now()) / 1000;
};
