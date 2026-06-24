import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { api } from '../services/api';

type Role = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
type AuthUser = { userId: number; schoolId?: number; username: string; roles: Role[] };
type AuthContextValue = { user?: AuthUser; login: (usernameOrEmail: string, password: string) => Promise<void>; logout: () => void };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | undefined>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : undefined;
  });

  async function login(usernameOrEmail: string, password: string) {
    const { data } = await api.post('/auth/login', { usernameOrEmail, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(undefined);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
