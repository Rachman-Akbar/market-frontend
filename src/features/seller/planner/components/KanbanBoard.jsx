import { useMemo, useRef, useState } from "react";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";
import { uploadMarketplaceImage, getMediaUploadError } from "@/shared/services/mediaUploadService";
import { cn } from "@/shared/utils/utils";
import {
  useBoard,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
  useMoveSchedule,
  useCompleteSchedule,
  plannerError,
} from "../services/plannerService";

const TYPE_OPTIONS = [
  { value: "task", label: "Task", color: "#3b82f6" },
  { value: "meeting", label: "Meeting", color: "#8b5cf6" },
  { value: "reminder", label: "Reminder", color: "#f59e0b" },
  { value: "shipment", label: "Shipment", color: "#10b981" },
  { value: "restock", label: "Restock", color: "#ef4444" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", dot: "bg-slate-400" },
  { value: "normal", label: "Normal", dot: "bg-blue-500" },
  { value: "high", label: "High", dot: "bg-amber-500" },
  { value: "urgent", label: "Urgent", dot: "bg-red-500" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "Belum" },
  { value: "in_progress", label: "Sedang Dikerjakan" },
  { value: "done", label: "Selesai" },
];

const TYPE_COLORS = {
  todo: "text-rose-600 bg-rose-50 border-rose-200",
  in_progress: "border-amber-200 bg-amber-50 text-amber-800",
  done: "border-emerald-300 bg-emerald-50 text-emerald-950",
};

function typeColor(type) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.color || "#6b7280";
}

function priorityDot(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.dot || "bg-slate-400";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return "Hari ini";
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const EMPTY_CARD = {
  title: "",
  description: "",
  type: "task",
  priority: "normal",
  assignee: "",
  label: "",
  date: todayIso(),
  start_time: "",
  end_time: "",
  is_all_day: true,
  status: "todo",
};

export default function KanbanBoard({ isAdmin, filterStoreId, filterType, filterPriority }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [cardModal, setCardModal] = useState(EMPTY_CARD);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [completeFor, setCompleteFor] = useState(null);
  const [proof, setProof] = useState({ note: "", files: [] });
  const [uploading, setUploading] = useState(false);
  const columnBodyRefs = useRef({});
  const fileInputRef = useRef(null);

  const boardParams = useMemo(() => {
    const params = {};
    if (isAdmin && filterStoreId) params.store_id = filterStoreId;
    if (filterType) params.type = filterType;
    if (filterPriority) params.priority = filterPriority;
    return params;
  }, [isAdmin, filterStoreId, filterType, filterPriority]);

  const { data: board, isLoading } = useBoard(boardParams);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();
  const moveMutation = useMoveSchedule();
  const completeMutation = useCompleteSchedule();

  const columns = board?.columns || { todo: [], in_progress: [], done: [] };

  const openNew = (status = "todo") => {
    setEditingId(null);
    setCardModal({ ...EMPTY_CARD, status });
    setShowForm(true);
  };

  const openEdit = (card) => {
    setEditingId(card.id);
    setCardModal({
      title: card.title || "",
      description: card.description || "",
      type: card.type || "task",
      priority: card.priority || "normal",
      assignee: card.assignee || "",
      label: card.label || "",
      date: card.date || todayIso(),
      start_time: card.start_time || "",
      end_time: card.end_time || "",
      is_all_day: card.is_all_day ?? true,
      status: card.status || "todo",
    });
    setShowForm(true);
  };

  const handleSaveCard = async () => {
    if (!cardModal.title.trim() || !cardModal.date) return;
    const values = {
      title: cardModal.title.trim(),
      description: cardModal.description.trim(),
      type: cardModal.type,
      priority: cardModal.priority,
      assignee: cardModal.assignee.trim(),
      label: cardModal.label.trim(),
      date: cardModal.date,
      start_time: cardModal.start_time || null,
      end_time: cardModal.end_time || null,
      is_all_day: cardModal.is_all_day,
      status: cardModal.status,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, values });
      } else {
        const payload = { ...values };
        if (isAdmin && filterStoreId) payload.store_id = Number(filterStoreId);
        await createMutation.mutateAsync(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setCardModal(EMPTY_CARD);
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleDeleteCard = async (card) => {
    if (!confirm(`Hapus jadwal "${card.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(card.id);
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleMove = async (id, status, toIndex = 99999) => {
    try {
      await moveMutation.mutateAsync({ id, values: { status, to_index: toIndex } });
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const openComplete = (card) => {
    setCompleteFor(card);
    setProof({
      note: card.completion_proof?.note || "",
      files: (card.completion_proof?.files || []).map((url) => ({ url: resolveMediaUrl(url), name: "" })),
    });
  };

  const handleComplete = async () => {
    if (!completeFor) return;
    try {
      await completeMutation.mutateAsync({
        id: completeFor.id,
        values: {
          note: proof.note.trim(),
          files: proof.files.map((f) => f.url),
        },
      });
      setCompleteFor(null);
      setProof({ note: "", files: [] });
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleUploadFiles = async (fileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(fileList || [])) {
        const uploaded = await uploadMarketplaceImage(file, "planner");
        setProof((prev) => ({ ...prev, files: [...prev.files, { url: uploaded.url, name: uploaded.name || file.name }] }));
      }
    } catch (e) {
      alert(getMediaUploadError(e));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const computeDropIndex = (status, clientY) => {
    const body = columnBodyRefs.current[status];
    if (!body) return 0;
    const cards = body.querySelectorAll('[data-card-key]');
    for (let i = 0; i < cards.length; i += 1) {
      const rect = cards[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return cards.length;
  };

  const handleDrop = (status) => (e) => {
    e.preventDefault();
    const id = draggingId || e.dataTransfer.getData("text/plain");
    setOverColumn(null);
    setDraggingId(null);
    if (!id) return;
    const index = computeDropIndex(status, e.clientY);
    handleMove(id, status, index);
  };

  const renderCard = (card, status) => {
    const isDone = status === "done" || card.status === "done";
    const proof = card.completion_proof || {};
    const proofFiles = Array.isArray(proof.files) ? proof.files : [];
    return (
      <div
        key={card.id}
        data-card-key={card.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", String(card.id));
          e.dataTransfer.effectAllowed = "move";
          setDraggingId(String(card.id));
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setOverColumn(null);
        }}
        className={cn(
          "group rounded-lg border-b bg-white p-3 shadow-sm transition hover:shadow",
          draggingId === String(card.id) && "opacity-40",
          isDone ? "border-slate-100" : "border-slate-200"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: typeColor(card.type) }} />
              <p className={cn("truncate text-sm font-medium", isDone ? "text-slate-400 line-through" : "text-slate-800")}>
                {card.title}
              </p>
            </div>
            {card.label && (
              <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {card.label}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            <button onClick={() => openEdit(card)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            {!isDone && (
              <button onClick={() => openComplete(card)} className="rounded p-1 text-emerald-500 hover:bg-emerald-50" title="Selesaikan dengan bukti">
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </button>
            )}
            <button onClick={() => handleDeleteCard(card)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">event</span>
            {formatDate(card.date)}
          </span>
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", priorityDot(card.priority))} />
          {card.assignee && (
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {card.assignee}
            </span>
          )}
        </div>

        {card.description && (
          <p className="mt-1.5 line-clamp-1 text-xs text-slate-500">{card.description}</p>
        )}

        {isDone && (proofFiles.length > 0 || proof.note) && (
          <div className="mt-2 border-t border-slate-100 pt-1.5">
            <div className="flex flex-wrap gap-1">
              {proofFiles.slice(0, 3).map((file, i) => (
                <span key={`${file}-${i}`} className="material-symbols-outlined text-sm text-emerald-600" title="Bukti foto terlampir">photo</span>
              ))}
              {proofFiles.length > 3 && <span className="text-[10px] text-slate-500">+{proofFiles.length - 3}</span>}
              {proof.note && <span className="material-symbols-outlined text-sm text-emerald-600" title="Ada catatan bukti">sticky_note_2</span>}
            </div>
          </div>
        )}

        {!isDone && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <select
              value={card.status}
              onChange={(e) => handleMove(card.id, e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-600 focus:border-emerald-400 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span className="text-[9px] text-slate-300">geser untuk pindah</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-sm text-slate-400">Memuat...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {STATUS_OPTIONS.map((column) => {
            const items = columns[column.value] || [];
            return (
              <div
                key={column.value}
                className={cn(
                  "flex min-h-[200px] flex-col rounded-xl border bg-slate-100/80",
                  column.value === "todo" && TYPE_COLORS.todo,
                  column.value === "in_progress" && TYPE_COLORS.in_progress,
                  column.value === "done" && TYPE_COLORS.done,
                  overColumn === column.value && "ring-2 ring-emerald-400 ring-offset-1"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOverColumn(column.value);
                }}
                onDragLeave={() => setOverColumn((cur) => (cur === column.value ? null : cur))}
                onDrop={handleDrop(column.value)}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{column.label}</h3>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {items.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openNew(column.value)}
                    className="rounded-md bg-white/80 p-1 text-slate-500 shadow-sm hover:bg-white hover:text-emerald-600"
                    title={`Tambah kartu ${column.label}`}
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
                <div ref={(node) => { columnBodyRefs.current[column.value] = node; }} className="flex-1 space-y-2 px-2 pb-2">
                  {items.map((card) => renderCard(card, column.value))}
                  {items.length === 0 && (
                    <button
                      onClick={() => openNew(column.value)}
                      className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-6 text-xs text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                    >
                      <span className="material-symbols-outlined mb-1 text-lg">add</span>
                      Tambah kartu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buat / Edit kartu */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{editingId ? "Edit Jadwal" : "Kartu Jadwal Baru"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Judul *</label>
                <input
                  type="text"
                  value={cardModal.title}
                  onChange={(e) => setCardModal({ ...cardModal, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  placeholder="Contoh: Packing pesanan pagi..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tipe</label>
                  <select value={cardModal.type} onChange={(e) => setCardModal({ ...cardModal, type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400">
                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Prioritas</label>
                  <select value={cardModal.priority} onChange={(e) => setCardModal({ ...cardModal, priority: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400">
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tenggat *</label>
                  <input type="date" value={cardModal.date} onChange={(e) => setCardModal({ ...cardModal, date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
                  <input type="text" value={cardModal.label} onChange={(e) => setCardModal({ ...cardModal, label: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Produk, Operasional..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Penanggung Jawab</label>
                  <input type="text" value={cardModal.assignee} onChange={(e) => setCardModal({ ...cardModal, assignee: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Nama tim / orang" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                  <select value={cardModal.status} onChange={(e) => setCardModal({ ...cardModal, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400">
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={cardModal.is_all_day} onChange={(e) => setCardModal({ ...cardModal, is_all_day: e.target.checked })} className="rounded" />
                  Sepanjang hari
                </label>
              </div>
              {!cardModal.is_all_day && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Mulai</label>
                    <input type="time" value={cardModal.start_time || ""} onChange={(e) => setCardModal({ ...cardModal, start_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Selesai</label>
                    <input type="time" value={cardModal.end_time || ""} onChange={(e) => setCardModal({ ...cardModal, end_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Deskripsi</label>
                <textarea value={cardModal.description} onChange={(e) => setCardModal({ ...cardModal, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Catatan tambahan..." />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSaveCard} disabled={!cardModal.title.trim() || !cardModal.date || createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
                {editingId ? "Simpan" : "Buat Kartu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selesaikan dengan bukti */}
      {completeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setCompleteFor(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Selesaikan Jadwal</h3>
            <p className="mb-4 text-sm text-slate-500">{completeFor.title}</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Bukti Foto / File (opsional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                  disabled={uploading}
                />
                {uploading && <p className="mt-1 text-xs text-slate-400">Mengunggah...</p>}
                {proof.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {proof.files.map((file, index) => (
                      <div key={`${file.url}-${index}`} className="relative">
                        <img src={file.url} alt={file.name || "Bukti"} className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                        <button
                          onClick={() => setProof((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white shadow hover:bg-red-600"
                          title="Hapus bukti"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Catatan Bukti (opsional)</label>
                <textarea
                  value={proof.note}
                  onChange={(e) => setProof({ ...proof, note: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  placeholder="Ringkasan hasil / bukti penyelesaian..."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCompleteFor(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleComplete} disabled={completeMutation.isPending} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
                Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}