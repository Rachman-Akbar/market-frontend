import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage } from "@/core/utils/apiClient";

function data(payload) {
  return payload?.data?.data ?? payload?.data ?? payload;
}

async function get(path, params = {}) {
  const response = await apiClient.get(path, { params });
  return data(response.data);
}

async function post(path, values) {
  const response = await apiClient.post(path, values);
  return data(response.data);
}

async function put(path, values) {
  const response = await apiClient.put(path, values);
  return data(response.data);
}

async function remove(path) {
  const response = await apiClient.delete(path);
  return data(response.data);
}

async function patch(path, values = {}) {
  const response = await apiClient.patch(path, values);
  return data(response.data);
}

export const plannerKeys = {
  all: ["planner"],
  lists: () => [...plannerKeys.all, "list"],
  list: (params) => [...plannerKeys.lists(), params],
  grid: (year, month, params) => [...plannerKeys.all, "grid", year, month, params],
  detail: (id) => [...plannerKeys.all, "detail", id],
};

function refresh(queryClient, keys) {
  return Promise.all(
    keys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
}

function useMutationHelper(mutationFn, keys) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => refresh(queryClient, keys),
  });
}

const BASE = "/api/v1/seller/planner";

export function useSchedules(params = {}) {
  return useQuery({
    queryKey: plannerKeys.list(params),
    queryFn: () => get(BASE, params),
    staleTime: 30_000,
  });
}

export function useGrid(year, month, params = {}) {
  return useQuery({
    queryKey: plannerKeys.grid(year, month, params),
    queryFn: () => get(`${BASE}/grid`, { year, month, ...params }),
    staleTime: 30_000,
  });
}

export function useScheduleDetail(id, enabled = true) {
  return useQuery({
    queryKey: plannerKeys.detail(id),
    queryFn: () => get(`${BASE}/${id}`),
    enabled: Boolean(id && enabled),
  });
}

export function useCreateSchedule() {
  return useMutationHelper((values) => post(BASE, values), [plannerKeys.all]);
}

export function useUpdateSchedule() {
  return useMutationHelper(
    ({ id, values }) => put(`${BASE}/${id}`, values),
    [plannerKeys.all]
  );
}

export function useDeleteSchedule() {
  return useMutationHelper((id) => remove(`${BASE}/${id}`), [plannerKeys.all]);
}

export function useCompleteSchedule() {
  return useMutationHelper(
    (id) => patch(`${BASE}/${id}/complete`),
    [plannerKeys.all]
  );
}

export function plannerError(error, fallback = "Data jadwal gagal diproses.") {
  return getApiMessage(error, fallback);
}
