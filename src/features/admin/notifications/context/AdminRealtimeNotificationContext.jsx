import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getEcho, getEchoStatus, subscribeEchoStatus } from "@/core/realtime/echo";
import {
  fetchAdminNotifications,
  fetchAdminNotificationState,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  normalizeRealtimeAdminNotification,
} from "@/features/admin/notifications/services/adminNotificationService";

const AdminRealtimeNotificationContext = createContext(null);

const MODULE_ROUTES = {
  orders: "/admin/orders",
  support: "/admin/help",
  promotion_payments: "/admin/promotion-payments",
  stores: "/admin/stores",
  chat: "/admin/chat",
};

const MODULE_QUERY_KEYS = {
  orders: [["admin", "orders"], ["order", "orderings"]],
  support: [["advanced", "tickets"]],
  promotion_payments: [["advanced", "promotion-payments"]],
  stores: [["admin", "stores"]],
  chat: [["communication", "conversations"]],
};

function addUnique(current, incoming) {
  if (!incoming?.id) return current;
  if (current.some((item) => Number(item.id) === Number(incoming.id))) return current;
  return [incoming, ...current].slice(0, 50);
}

export function AdminRealtimeNotificationProvider({ children }) {
  const { user, activeRole } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [moduleCounts, setModuleCounts] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(getEchoStatus());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const mountedRef = useRef(true);
  const seenIdsRef = useRef(new Set());

  const applyState = useCallback((state) => {
    if (!state) return;
    setUnreadCount(Number(state.unreadCount || 0));
    setModuleCounts(state.moduleCounts || {});
  }, []);

  const loadInitial = useCallback(async () => {
    if (!user?.id || activeRole !== "admin") return;
    setLoading(true);
    try {
      const result = await fetchAdminNotifications({ per_page: 30 });
      if (!mountedRef.current) return;
      setNotifications(result.rows);
      seenIdsRef.current = new Set(result.rows.map((item) => Number(item.id)));
      applyState(result.state);
    } catch {
      if (mountedRef.current) setNotifications([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [activeRole, applyState, user?.id]);

  const reconcileState = useCallback(async () => {
    if (!user?.id || activeRole !== "admin") return;
    try {
      const state = await fetchAdminNotificationState();
      if (mountedRef.current) applyState(state);
    } catch {
      return;
    }
  }, [activeRole, applyState, user?.id]);

  const invalidateActiveModule = useCallback((module) => {
    const route = MODULE_ROUTES[module];
    if (!route || location.pathname !== route) return;
    (MODULE_QUERY_KEYS[module] || []).forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [location.pathname, queryClient]);

  const receiveRealtime = useCallback((payload) => {
    const incoming = normalizeRealtimeAdminNotification(payload);
    if (!incoming?.id) return;
    const id = Number(incoming.id);
    if (seenIdsRef.current.has(id)) return;
    seenIdsRef.current.add(id);
    setNotifications((current) => addUnique(current, incoming));
    setUnreadCount((current) => current + 1);
    setModuleCounts((current) => ({
      ...current,
      [incoming.module]: Number(current[incoming.module] || 0) + 1,
    }));
    invalidateActiveModule(incoming.module);
  }, [invalidateActiveModule]);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();
    return () => {
      mountedRef.current = false;
    };
  }, [loadInitial]);

  useEffect(() => {
    if (!user?.id || activeRole !== "admin") return undefined;
    const unsubscribeStatus = subscribeEchoStatus(setConnectionStatus);
    const echo = getEcho();
    if (!echo) return unsubscribeStatus;

    const channelName = `admin.${user.id}.notifications`;
    echo.private(channelName).listen(".admin.notification.created", receiveRealtime);

    return () => {
      unsubscribeStatus();
      echo.leave(channelName);
    };
  }, [activeRole, receiveRealtime, user?.id]);

  useEffect(() => {
    if (!user?.id || activeRole !== "admin" || connectionStatus === "connected") return undefined;
    const interval = window.setInterval(reconcileState, 60000);
    return () => window.clearInterval(interval);
  }, [activeRole, connectionStatus, reconcileState, user?.id]);

  const markRead = useCallback(async (notification) => {
    if (!notification?.id || notification.readAt) return notification;
    const result = await markAdminNotificationRead(notification.id);
    setNotifications((current) => current.map((item) => Number(item.id) === Number(notification.id) ? result.row : item));
    applyState(result.state);
    return result.row;
  }, [applyState]);

  const markAllRead = useCallback(async (module = "") => {
    const state = await markAllAdminNotificationsRead(module);
    setNotifications((current) => current.map((item) => {
      if (item.readAt) return item;
      if (module && item.module !== module) return item;
      return { ...item, readAt: new Date().toISOString() };
    }));
    applyState(state);
  }, [applyState]);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchAdminNotifications({ per_page: 30 });
      setNotifications(result.rows);
      seenIdsRef.current = new Set(result.rows.map((item) => Number(item.id)));
      applyState(result.state);
    } catch {
      return;
    }
  }, [applyState]);

  useEffect(() => {
    if (!open || activeRole !== "admin") return;
    refresh();
  }, [activeRole, open, refresh]);

  const badges = useMemo(() => ({
    "/admin/orders": Number(moduleCounts.orders || 0),
    "/admin/help": Number(moduleCounts.support || 0),
    "/admin/promotion-payments": Number(moduleCounts.promotion_payments || 0),
    "/admin/stores": Number(moduleCounts.stores || 0),
    "/admin/chat": Number(moduleCounts.chat || 0),
  }), [moduleCounts]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    moduleCounts,
    badges,
    connectionStatus,
    connected: connectionStatus === "connected",
    loading,
    open,
    setOpen,
    markRead,
    markAllRead,
    refresh,
  }), [badges, connectionStatus, loading, markAllRead, markRead, moduleCounts, notifications, open, refresh, unreadCount]);

  return <AdminRealtimeNotificationContext.Provider value={value}>{children}</AdminRealtimeNotificationContext.Provider>;
}

export function useAdminRealtimeNotifications() {
  const context = useContext(AdminRealtimeNotificationContext);
  if (!context) throw new Error("useAdminRealtimeNotifications harus digunakan di dalam AdminRealtimeNotificationProvider");
  return context;
}
