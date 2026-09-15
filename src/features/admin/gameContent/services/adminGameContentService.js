import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { toBoolean } from "@/core/utils/boolean";

export const adminGameContentKeys = {
  all: ["admin", "game-content"],
  list: (params = {}) => ["admin", "game-content", params],
  types: ["admin", "game-content", "types"],
};

export const GAME_TYPE_META = {
  quiz: {
    label: "Quiz",
    icon: "quiz",
    description: "Soal pilihan ganda: pertanyaan, opsi jawaban, dan jawaban benar.",
  },
  myth_fact: {
    label: "Myth & Fact",
    icon: "fact_check",
    description: "Pernyataan benar/salah (mitos vs fakta).",
  },
  trash_sort: {
    label: "Sortir Sampah",
    icon: "recycling",
    description: "Benda yang harus dibuang ke tong sampah sesuai warna.",
  },
  match_card: {
    label: "Match Card SDG",
    icon: "style",
    description: "Kartu 17 tujuan SDG: pairing pernyataan dengan tujuan.",
  },
  arithmetic_kilat: {
    label: "Arithmetic Kilat",
    icon: "calculate",
    description: "Soal berhitung yang digenerasi otomatis — data tidak diperlukan.",
  },
};

export const GAME_TYPES = Object.keys(GAME_TYPE_META);

export function normalizeAdminGameContent(row = {}) {
  let payload = row.payload;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = [];
    }
  }
  return {
    id: Number(row.id || 0),
    gameType: row.game_type || row.gameType || "",
    title: row.title || "",
    difficulty: row.difficulty || "",
    itemsCount: Number(row.items_count ?? (Array.isArray(payload) ? payload.length : 0)),
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    payload: payload ?? [],
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

export function serializeAdminGameContent(values) {
  return {
    game_type: values.gameType,
    title: values.title.trim(),
    difficulty: (values.difficulty || "").trim() || null,
    payload: values.payload,
    is_active: Boolean(values.isActive),
  };
}

export async function getAdminGameContent(params = {}) {
  const response = await apiClient.get("/api/v1/admin/game-content", { params });
  return unwrapCollection(response.data).map(normalizeAdminGameContent);
}

export async function getGameContentTypes() {
  const response = await apiClient.get("/api/v1/admin/game-content/types");
  return unwrapApiData(response.data);
}

export async function createAdminGameContent(values) {
  const response = await apiClient.post("/api/v1/admin/game-content", serializeAdminGameContent(values));
  return normalizeAdminGameContent(unwrapApiData(response.data));
}

export async function updateAdminGameContent(id, values) {
  const response = await apiClient.put(`/api/v1/admin/game-content/${id}`, serializeAdminGameContent(values));
  return normalizeAdminGameContent(unwrapApiData(response.data));
}

export async function deleteAdminGameContent(id) {
  return apiClient.delete(`/api/v1/admin/game-content/${id}`);
}

function refreshGameContentQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: adminGameContentKeys.all });
}

export function useAdminGameContent(params = {}) {
  return useQuery({
    queryKey: adminGameContentKeys.list(params),
    queryFn: () => getAdminGameContent(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useGameContentTypes() {
  return useQuery({
    queryKey: adminGameContentKeys.types,
    queryFn: getGameContentTypes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminGameContent,
    onSettled: () => refreshGameContentQueries(queryClient),
  });
}

export function useUpdateAdminGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateAdminGameContent(id, values),
    onSettled: () => refreshGameContentQueries(queryClient),
  });
}

export function useDeleteAdminGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminGameContent,
    onSettled: () => refreshGameContentQueries(queryClient),
  });
}

export function getAdminGameContentError(error) {
  return getApiMessage(error, "Konten permainan gagal diproses oleh admin.");
}

// ── Payload helpers ─────────────────────────────────────────────────────────

export function emptyPayloadForType(gameType) {
  switch (gameType) {
    case "quiz":
      return [
        {
          question: "",
          options: ["", "", "", ""],
          correct_answer: "",
          difficulty: "",
          explanation: "",
        },
      ];
    case "myth_fact":
      return [{ statement: "", is_fact: true, image_url: "" }];
    case "trash_sort":
      return [{ name: "", bin_color: "Kuning", category: "", image_key: "" }];
    case "match_card":
      return {
        goals: [{ goal_number: 1, name: "Tanpa Kemiskinan" }],
        statements: [{ id: 1, text: "", goal_id: 1 }],
      };
    default:
      return [];
  }
}

export function payloadTypeHint(gameType) {
  switch (gameType) {
    case "quiz":
      return "Susun pertanyaan dengan opsi A–D; tandai jawaban yang benar.";
    case "myth_fact":
      return "Pernyataan dengan tanda benar (fakta) atau salah (mitos).";
    case "trash_sort":
      return "Warna tong: Kuning, Merah, Hijau, Biru, atau Abu.";
    case "match_card":
      return "Jumlah goal 1–17; setiap statement terikat ke goal_number.";
    default:
      return "Data tidak diperlukan — soal digenerasi otomatis.";
  }
}