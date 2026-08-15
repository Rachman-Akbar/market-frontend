import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

function normalizeRole(value) {
  return String(value || "").toLowerCase().trim();
}

function normalizeRoles(values = []) {
  return Array.isArray(values)
    ? values.map(normalizeRole).filter(Boolean)
    : [];
}

function resolveStore(session = {}) {
  return session?.store || session?.user?.store || null;
}

function getLoginPath(role, redirect) {
  const path = role === "admin" ? "/admin/login" : "/auth/login";
  const params = new URLSearchParams({ redirect });
  return `${path}?${params.toString()}`;
}

export default function RoleSwitchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshMe, switchRole } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const query = new URLSearchParams(location.search);
    const targetRole = normalizeRole(query.get("role") || "seller");
    const defaultRedirect = targetRole === "admin" ? "/admin" : "/seller";
    const redirect = query.get("redirect") || defaultRedirect;

    const prepareSession = async () => {
      let currentSession = null;

      try {
        currentSession = await refreshMe();
      } catch {
        currentSession = null;
      }

      const roles = normalizeRoles(
        currentSession?.roles || currentSession?.user?.roles || [],
      );
      const activeRole = normalizeRole(
        currentSession?.activeRole ||
          currentSession?.active_role ||
          currentSession?.user?.role,
      );

      if (!roles.includes(targetRole) && activeRole !== targetRole) {
        navigate(getLoginPath(targetRole, redirect), { replace: true });
        return;
      }

      if (targetRole === "seller" && !resolveStore(currentSession)?.id) {
        navigate(
          "/auth/seller/onboarding",
          {
            state: {
              from: redirect,
              reason: "store_missing",
            },
            replace: true,
          },
        );
        return;
      }

      if (activeRole === targetRole) {
        navigate(redirect, { replace: true });
        return;
      }

      try {
        await switchRole(targetRole, {
          deviceName: `marketplace-web-${targetRole}`,
          storageScope: "window",
        });
        navigate(redirect, { replace: true });
      } catch {
        if (targetRole === "seller") {
          navigate(
            "/auth/seller/onboarding",
            {
              state: {
                from: redirect,
                reason: "seller_access_unavailable",
              },
              replace: true,
            },
          );
          return;
        }

        navigate(getLoginPath(targetRole, redirect), { replace: true });
      }
    };

    prepareSession();
  }, [location.search, navigate, refreshMe, switchRole]);

  return null;
}
