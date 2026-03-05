import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  role?: "admin" | "user";
}

export const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allowed
  return <Outlet />;
};