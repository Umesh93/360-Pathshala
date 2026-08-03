import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { decodeJwt } from "../utils/jwt";

export interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  schoolId: number | null;
  username: string | null;
  roles: string[];
}

interface AuthContextType extends AuthState {
  setAuth: (state: AuthState) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  token: null,
  role: null,
  userId: null,
  schoolId: null,
  username: null,
  roles: [],
};

const initAuth = (): AuthState => {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = decodeJwt(token);
    if (payload) {
      return {
        token,
        role: payload.roles?.[0] || null,
        userId: payload.userId || null,
        schoolId: payload.schoolId || null,
        username: payload.sub || null,
        roles: payload.roles || [],
      };
    }
  }
  return initialState;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  setAuth: () => {},
  clearAuth: () => {},
});

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [auth, setAuthState] = useState<AuthState>(initAuth);

  const setAuth = (state: AuthState) => {
    if (state.token) localStorage.setItem("token", state.token);
    if (state.role) localStorage.setItem("role", state.role);
    if (state.userId) localStorage.setItem("userId", String(state.userId));
    if (state.schoolId) localStorage.setItem("schoolId", String(state.schoolId));
    if (state.username) localStorage.setItem("username", state.username);
    setAuthState(state);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("schoolId");
    setAuthState(initialState);
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
