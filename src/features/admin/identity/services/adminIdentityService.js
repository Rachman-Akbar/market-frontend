import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";

export const adminIdentityKeys = {
  users: ["admin", "identity", "users"],
  roles: ["admin", "identity", "roles"],
  permissions: ["admin", "identity", "permissions"],
};

function normalizeRoleReference(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
  };
}

export function normalizeUser(row = {}) {
  return {
    id: String(row.id || ""),
    name: row.name || "",
    email: row.email || "",
    avatar: row.avatar || "",
    isEmailVerified: Boolean(row.is_email_verified ?? row.isEmailVerified),
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    bannedAt: row.banned_at || row.bannedAt || "",
    roles: (row.roles || []).map(normalizeRoleReference),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

export function normalizeRole(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    description: row.description || "",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    permissions: (row.permissions || []).map((permission) => ({
      id: Number(permission.id || 0),
      name: permission.name || "",
      isActive: Boolean(permission.is_active ?? permission.isActive ?? true),
    })),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

function normalizePermission(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    description: row.description || "",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
  };
}

function serializeUser(values, editing = false) {
  const payload = {
    name: String(values.name || "").trim(),
    email: String(values.email || "").trim().toLowerCase(),
    avatar: String(values.avatar || "").trim() || null,
    is_email_verified: Boolean(values.isEmailVerified),
    is_active: values.isBanned ? false : Boolean(values.isActive),
    banned_at: values.isBanned ? values.bannedAt || new Date().toISOString() : null,
    role_ids: (values.roleIds || []).map(Number).filter(Boolean),
  };

  if (String(values.password || "").trim()) {
    payload.password = String(values.password).trim();
  }

  if (!editing && !payload.password) {
    delete payload.password;
  }

  return payload;
}

function serializeRole(values) {
  return {
    name: String(values.name || "").trim().toLowerCase(),
    description: String(values.description || "").trim() || null,
    is_active: Boolean(values.isActive),
    permission_ids: (values.permissionIds || []).map(Number).filter(Boolean),
  };
}

export async function getAdminUsers() {
  const response = await apiClient.get("/api/v1/identity/users", { params: { per_page: 100 } });
  return unwrapCollection(response.data).map(normalizeUser);
}

export async function createAdminUser(values) {
  const response = await apiClient.post("/api/v1/identity/users", serializeUser(values));
  return normalizeUser(unwrapApiData(response.data));
}

export async function updateAdminUser(id, values) {
  const response = await apiClient.put(`/api/v1/identity/users/${id}`, serializeUser(values, true));
  return normalizeUser(unwrapApiData(response.data));
}

export async function deleteAdminUser(id) {
  return apiClient.delete(`/api/v1/identity/users/${id}`);
}

export async function getAdminRoles() {
  const response = await apiClient.get("/api/v1/identity/roles", { params: { per_page: 100 } });
  return unwrapCollection(response.data).map(normalizeRole);
}

export async function createAdminRole(values) {
  const response = await apiClient.post("/api/v1/identity/roles", serializeRole(values));
  return normalizeRole(unwrapApiData(response.data));
}

export async function updateAdminRole(id, values) {
  const response = await apiClient.put(`/api/v1/identity/roles/${id}`, serializeRole(values));
  return normalizeRole(unwrapApiData(response.data));
}

export async function deleteAdminRole(id) {
  return apiClient.delete(`/api/v1/identity/roles/${id}`);
}

export async function getAdminPermissions() {
  const response = await apiClient.get("/api/v1/identity/permissions");
  return unwrapCollection(response.data).map(normalizePermission);
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminIdentityKeys.users, queryFn: getAdminUsers });
}

export function useAdminRoles() {
  return useQuery({ queryKey: adminIdentityKeys.roles, queryFn: getAdminRoles, staleTime: 5 * 60 * 1000 });
}

export function useAdminPermissions() {
  return useQuery({ queryKey: adminIdentityKeys.permissions, queryFn: getAdminPermissions, staleTime: 5 * 60 * 1000 });
}

export function useCreateAdminUser() {
  return useMutation({ mutationFn: createAdminUser });
}

export function useUpdateAdminUser() {
  return useMutation({ mutationFn: ({ id, values }) => updateAdminUser(id, values) });
}

export function useDeleteAdminUser() {
  return useMutation({ mutationFn: deleteAdminUser });
}

export function useCreateAdminRole() {
  return useMutation({ mutationFn: createAdminRole });
}

export function useUpdateAdminRole() {
  return useMutation({ mutationFn: ({ id, values }) => updateAdminRole(id, values) });
}

export function useDeleteAdminRole() {
  return useMutation({ mutationFn: deleteAdminRole });
}

export function getAdminIdentityError(error) {
  return getApiMessage(error, "Data user atau role gagal diproses.");
}
