import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { isTokenExpired } from "../utils/jwt";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { role, token } = useAuth();
  const location = useLocation();

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("schoolId");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
