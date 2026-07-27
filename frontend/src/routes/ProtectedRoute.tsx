import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { isTokenExpired } from "../utils/jwt";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("schoolId");
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
