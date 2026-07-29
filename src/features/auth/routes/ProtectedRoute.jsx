import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#10B981]" />
    </div>
  );
}

function normalizeRoles(values = []) {
  return Array.isArray(values)
    ? values.map((role) => String(role || "").toLowerCase().trim()).filter(Boolean)
    : [];
}

export default function ProtectedRoute({
  children,
  roles: requiredRoles = [],
  loginPath = "/auth/login",
}) {
  const location = useLocation();
  const {
    initializing,
    isAuthenticated,
    activeRole,
    roles: accountRoles,
  } = useAuth();

  if (initializing) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const allowedRoles = normalizeRoles(requiredRoles);

  if (!allowedRoles.length) {
    return children || <Outlet />;
  }

  const normalizedActiveRole = String(activeRole || "").toLowerCase().trim();

  if (allowedRoles.includes(normalizedActiveRole)) {
    return children || <Outlet />;
  }

  const normalizedAccountRoles = normalizeRoles(accountRoles);
  const switchableRole = allowedRoles.find((role) => normalizedAccountRoles.includes(role));

  if (switchableRole) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    const params = new URLSearchParams({
      role: switchableRole,
      redirect,
    });

    return <Navigate to={`/auth/role-switch?${params.toString()}`} replace />;
  }

  return <Navigate to={loginPath} state={{ from: location }} replace />;
}
