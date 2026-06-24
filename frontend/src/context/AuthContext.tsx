import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  role: string | null;
  setRole: (role: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
});

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [role, setRole] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
