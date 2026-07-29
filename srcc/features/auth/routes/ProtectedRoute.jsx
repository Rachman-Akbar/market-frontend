import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#10B981]" />
    </div>
  );
}

export default function ProtectedRoute({ children, roles = [] }) {
  const location = useLocation();
  const { initializing, isAuthenticated, activeRole } = useAuth();

  if (initializing) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const allowedRoles = Array.isArray(roles)
    ? roles.map((role) => String(role).toLowerCase())
    : [];
  const hasRoleAccess =
    allowedRoles.length === 0 ||
    allowedRoles.includes(String(activeRole).toLowerCase());

  if (!hasRoleAccess) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}
