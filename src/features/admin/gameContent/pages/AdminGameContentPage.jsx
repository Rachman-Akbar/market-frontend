import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { AdminGameContentEditor } from "@/features/admin/gameContent/components/AdminGameContentEditor";
import {
  GAME_TYPES,
  GAME_TYPE_META,
  getAdminGameContentError,
  useAdminGameContent,
  useDeleteAdminGameContent,
  useUpdateAdminGameContent,
} from "@/features/admin/gameContent/services/adminGameContentService";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";

export default function AdminGameContentPage() {
  const [gameType, setGameType] = useState("quiz");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const notifications = useNotificationCenter();

  const listQuery = useAdminGameContent({
    game_type: gameType,
    ...(query ? { search: query } : {}),
  });
  const updateMutation = useUpdateAdminGameContent();
  const deleteMutation = useDeleteAdminGameContent();

  const rows = listQuery.data || [];

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setEditorOpen(true);
  };

  const toggleActive = (row, isActive) => {
    updateMutation.mutate(
      { id: row.id, values: { ...row, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Game Content", message: `Konten berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Game Content", message: getAdminGameContentError(error) }),
      },
    );
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      notifications.push({ type: "success", title: "Game Content", message: "Konten berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Game Content", message: getAdminGameContentError(error) });
    }
  };

  return (
    <AdminShell title="Game Content" subtitle="Kelola data tiap game: soal quiz, pernyataan myth/fact, item sortir sampah, kartu SDG, dan lainnya. Data ini dipakai aplikasi market-game.">
      <EntityToolbar
        query={query}
        onQueryChange={setQuery}
        onCreate={openCreate}
        onRefresh={() => listQuery.refetch()}
        refreshing={listQuery.isFetching}
        createLabel="Tambah Konten"
        placeholder="Cari judul konten lalu tekan Enter"
        filters={
          <div className="flex flex-wrap items-center gap-1.5">
            {GAME_TYPES.map((type) => {
              const active = gameType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGameType(type)}
                  className={`inline-flex h-9 items-center gap-1.5 px-3 text-xs font-extrabold transition-colors ${
                    active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={GAME_TYPE_META[type].description}
                >
                  <span className="material-symbols-outlined text-[16px]">{GAME_TYPE_META[type].icon}</span>
                  {GAME_TYPE_META[type].label}
                </button>
              );
            })}
          </div>
        }
        hasActiveFilters={Boolean(query)}
        onClearFilters={() => setQuery("")}
      />

      <AsyncState loading={listQuery.isLoading} error={listQuery.error ? getAdminGameContentError(listQuery.error) : ""} empty={!listQuery.isLoading && !rows.length} emptyText={`Belum ada konten untuk game ${GAME_TYPE_META[gameType].label}.`} />

      {rows.length ? (
        <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Diperbarui</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">#{row.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{row.title}</td>
                  <td className="px-4 py-3 text-slate-500">{row.difficulty || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{row.itemsCount} item</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(row, !row.isActive)}
                      disabled={updateMutation.isPending}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors disabled:opacity-60 ${
                        row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {row.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => openEdit(row)} className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-extrabold text-teal-700 hover:bg-teal-50">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(row)} className="inline-flex h-8 items-center gap-1.5 px-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AdminGameContentEditor
        open={editorOpen}
        entity={editing}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          notifications.push({ type: "success", title: "Game Content", message: editing ? "Konten berhasil diperbarui." : "Konten berhasil ditambahkan." });
          setEditorOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Konten Game" message={`Konten “${deleteTarget?.title || ""}” akan dihapus dan tidak lagi dipakai game.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}