import { apiClient } from "@/core/utils/apiClient";

function normalizeState(source = {}) {
  return {
    unreadCount: Number(source.unread_count || 0),
    moduleCounts: Object.fromEntries(
      Object.entries(source.module_counts || {}).map(([key, value]) => [key, Number(value || 0)]),
    ),
  };
}

function normalizeNotification(row = {}) {
  return {
    id: Number(row.id || 0),
    module: row.module || "general",
    type: row.type || "general",
    title: row.title || "Notifikasi",
    message: row.message || "",
    referenceType: row.reference_type || null,
    referenceId: row.reference_id || null,
    url: row.url || "",
    meta: row.meta || null,
    actor: row.actor || null,
    store: row.store || null,
    readAt: row.read_at || null,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchAdminNotifications(params = {}) {
  const response = await apiClient.get("/api/v1/admin/notifications", { params });
  const payload = response.data || {};
  const source = payload.data || {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : [];

  return {
    rows: rows.map(normalizeNotification),
    state: normalizeState(payload.state || source.state || {}),
    meta: payload.meta || source.meta || {
      current_page: source.current_page || 1,
      last_page: source.last_page || 1,
      total: source.total || rows.length,
    },
  };
}

export async function fetchAdminNotificationState() {
  const response = await apiClient.get("/api/v1/admin/notifications/state");
  return normalizeState(response.data?.data || {});
}

export async function markAdminNotificationRead(id) {
  const response = await apiClient.patch(`/api/v1/admin/notifications/${id}/read`);
  return {
    row: normalizeNotification(response.data?.data || {}),
    state: normalizeState(response.data?.state || {}),
  };
}

export async function markAllAdminNotificationsRead(module = "") {
  const response = await apiClient.patch("/api/v1/admin/notifications/read-all", module ? { module } : {});
  return normalizeState(response.data?.data || {});
}

export function normalizeRealtimeAdminNotification(event = {}) {
  return normalizeNotification(event?.notification || event);
}
