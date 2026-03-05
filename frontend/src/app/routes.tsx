import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./root";
import { Login } from "./pages/login";
import { UserDashboard } from "./pages/user-dashboard";
import { AdminDashboard } from "./pages/admin-dashboard";
import { UserRegisterApi } from "./pages/user-register-api";
import { ForgotPassword } from "./pages/forgot-password";
import { ResetPassword } from "./pages/reset-password";
import { AdminManageUsers } from "./pages/admin-manage-users";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "reset-password",
        Component: ResetPassword,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: "user",
        element: <ProtectedRoute role="user" />,
        children: [
          {
            path: "dashboard",
            Component: UserDashboard,
          },
          {
            path: "register",
            Component: UserRegisterApi,
          },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            path: "dashboard",
            Component: AdminDashboard,
          },
          {
            path: "manage-users",
            Component: AdminManageUsers,
          }
          // ✅ system-config route removed
        ],
      },
    ],
  },
]);

function DashboardRedirect() {
  const role = localStorage.getItem("userRole");
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "user") return <Navigate to="/user/dashboard" replace />;
  return <Navigate to="/" replace />;
}