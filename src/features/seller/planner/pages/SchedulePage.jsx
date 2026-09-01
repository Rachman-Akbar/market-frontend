import { useState, useRef, useCallback, useMemo } from "react";
import html2canvas from "html2canvas";
import {
  useSchedules,
  useGrid,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCompleteSchedule,
  plannerError,
} from "../services/plannerService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useStoreContextStores } from "@/features/admin/storeContext/services/adminStoreContextService";
import { cn } from "@/shared/utils/utils";

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

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function typeColor(type) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.color || "#6b7280";
}

function priorityDot(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.dot || "bg-slate-400";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function toDateString(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayString() {
  const d = new Date();
  return toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "task",
  priority: "normal",
  color: "",
  date: "",
  start_time: "",
  end_time: "",
  is_all_day: true,
};

const SWIPE_THRESHOLD = 60;

export default function SchedulePage() {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === "admin";

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState("board");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStoreId, setFilterStoreId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [slideDir, setSlideDir] = useState(null);

  const calendarRef = useRef(null);
  const swipeStartX = useRef(null);

  const storesQuery = useStoreContextStores({ search: undefined, per_page: 100 }, isAdmin);
  const adminStores = storesQuery.data?.rows || [];

  const queryParams = useMemo(() => {
    const p = { per_page: 100 };
    if (filterType) p.type = filterType;
    if (filterPriority) p.priority = filterPriority;
    if (isAdmin && filterStoreId) p.store_id = filterStoreId;
    return p;
  }, [filterType, filterPriority, filterStoreId, isAdmin]);

  const { data: gridData, isLoading: gridLoading } = useGrid(year, month, isAdmin && filterStoreId ? { store_id: filterStoreId } : {});
  const { data: listData, isLoading: listLoading } = useSchedules(queryParams);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();
  const completeMutation = useCompleteSchedule();

  const schedulesByDate = useMemo(() => {
    const map = {};
    const days = gridData?.grid || [];
    for (const day of days) {
      map[day.date] = (day.schedules || []).map((s) => ({
        ...s,
        date: day.date,
        day_name: day.day_name,
      }));
    }
    return map;
  }, [gridData]);

  const listItems = useMemo(() => {
    return listData?.rows || listData || [];
  }, [listData]);

  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today = todayString();

  const goToMonth = useCallback((nextYear, nextMonth, dir) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setSlideDir(dir);
  }, []);

  const prevMonth = useCallback(() => {
    if (month === 1) goToMonth(year - 1, 12, "right");
    else goToMonth(year, month - 1, "right");
  }, [month, year, goToMonth]);

  const nextMonth = useCallback(() => {
    if (month === 12) goToMonth(year + 1, 1, "left");
    else goToMonth(year, month + 1, "left");
  }, [month, year, goToMonth]);

  const goToday = useCallback(() => {
    const d = new Date();
    const dir = d.getFullYear() * 12 + d.getMonth() < year * 12 + (month - 1) ? "right" : "left";
    goToMonth(d.getFullYear(), d.getMonth() + 1, dir);
  }, [month, year, goToMonth]);

  const handleSwipeStart = (e) => {
    swipeStartX.current = e.clientX;
  };

  const handleSwipeEnd = (e) => {
    if (swipeStartX.current === null) return;
    const delta = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (delta > SWIPE_THRESHOLD) prevMonth();
    else if (delta < -SWIPE_THRESHOLD) nextMonth();
  };

  const openNew = (date) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: date || today });
    setShowForm(true);
  };

  const openEdit = (schedule) => {
    setEditingId(schedule.id);
    setForm({
      title: schedule.title || "",
      description: schedule.description || "",
      type: schedule.type || "task",
      priority: schedule.priority || "normal",
      color: schedule.color || "",
      date: schedule.date || "",
      start_time: schedule.start_time || "",
      end_time: schedule.end_time || "",
      is_all_day: schedule.is_all_day ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, values: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeMutation.mutateAsync(id);
    } catch (e) {
      alert(plannerError(e));
    }
  };

  const handleExport = useCallback(async () => {
    if (!calendarRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `jadwal-${year}-${String(month).padStart(2, "0")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("Gagal export gambar.");
    } finally {
      setExporting(false);
    }
  }, [year, month]);

  const monthLabel = new Date(year, month - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-w-0 max-w-full">
      <style>{`
        @keyframes slide-in-right { from { transform: translateX(48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-in-left { from { transform: translateX(-48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .schedule-slide { animation-duration: 260ms; animation-timing-function: ease-out; }
        .schedule-slide-right { animation-name: slide-in-left; }
        .schedule-slide-left { animation-name: slide-in-right; }
      `}</style>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">Aplikasi</p>
        <h1 className="mt-1 text-2xl font-light text-slate-900">Planner / Jadwal</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? "Pantau jadwal tiap toko dalam satu papan yang dapat digeser, atau lihat tabel ringkas."
            : "Kelola jadwal harian dan mingguan toko Anda. Geser papan untuk berpindah bulan."}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={prevMonth} className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100" title="Bulan sebelumnya">&lsaquo;</button>
          <span className="min-w-[140px] text-center text-sm font-medium text-slate-800">{monthLabel}</span>
          <button onClick={nextMonth} className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100" title="Bulan berikutnya">&rsaquo;</button>
          <button onClick={goToday} className="ml-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200">Hari ini</button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={() => setViewMode("board")} className={cn("rounded-md px-3 py-1 text-xs font-medium transition", viewMode === "board" ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-100")}>Papan</button>
          <button onClick={() => setViewMode("table")} className={cn("rounded-md px-3 py-1 text-xs font-medium transition", viewMode === "table" ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-100")}>Tabel</button>
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
          <option value="">Semua Tipe</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
          <option value="">Semua Prioritas</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {isAdmin && (
          <select value={filterStoreId} onChange={(e) => setFilterStoreId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
            <option value="">Jadwal Saya (Admin)</option>
            {adminStores.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">download</span>
            {exporting ? "Exporting..." : "Export Gambar"}
          </button>
          <button onClick={() => openNew()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            <span className="material-symbols-outlined text-sm">add</span>
            Jadwal Baru
          </button>
        </div>
      </div>

      {/* Calendar / Table content (this gets exported as image) */}
      <div ref={calendarRef} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {viewMode === "board" ? (
          <div
            key={`${year}-${month}`}
            className={cn("schedule-slide", slideDir === "left" ? "schedule-slide-left" : slideDir === "right" ? "schedule-slide-right" : "")}
            style={{ touchAction: "pan-y", cursor: "grab" }}
            onPointerDown={handleSwipeStart}
            onPointerUp={handleSwipeEnd}
            onPointerCancel={() => { swipeStartX.current = null; }}
            onPointerMove={(e) => { if (swipeStartX.current !== null && Math.abs(e.clientX - swipeStartX.current) > 8) e.currentTarget.style.cursor = "grabbing"; }}
          >
            {gridLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-400">Memuat...</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="px-2 py-2 text-center text-xs font-semibold text-slate-500">{w}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-slate-100 bg-slate-50/50" />
                  ))}
                  {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = toDateString(year, month, day);
                    const isToday = dateStr === today;
                    const daySchedules = schedulesByDate[dateStr] || [];
                    return (
                      <div
                        key={day}
                        className={cn(
                          "min-h-[90px] border-b border-r border-slate-100 p-1.5 cursor-pointer transition hover:bg-emerald-50/30",
                          isToday && "bg-emerald-50/60"
                        )}
                        onClick={() => setSelectedDate(dateStr)}
                        onDoubleClick={() => openNew(dateStr)}
                      >
                        <div className={cn(
                          "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                          isToday ? "bg-emerald-500 text-white" : "text-slate-700"
                        )}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {daySchedules.slice(0, 3).map((s) => (
                            <div
                              key={s.id}
                              onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                              className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight text-white cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: typeColor(s.type) }}
                              title={s.title}
                            >
                              {s.start_time && <span className="shrink-0">{s.start_time}</span>}
                              <span className="truncate">{s.title}</span>
                            </div>
                          ))}
                          {daySchedules.length > 3 && (
                            <div className="px-1 text-[10px] text-slate-400">+{daySchedules.length - 3} lagi</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {Array.from({ length: (7 - ((startDay + days) % 7)) % 7 }).map((_, i) => (
                    <div key={`end-${i}`} className="min-h-[90px] border-b border-r border-slate-100 bg-slate-50/50" />
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-1.5 text-center text-[10px] text-slate-400">
              Geser papan ke kiri/kanan untuk berganti bulan
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-400">Memuat...</div>
            ) : listItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined mb-2 text-3xl">event_note</span>
                <p className="text-sm">Belum ada jadwal.</p>
              </div>
            ) : (
              listItems.map((s) => (
                <div key={s.id} className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: typeColor(s.type) }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("text-sm font-medium", s.is_completed ? "text-slate-400 line-through" : "text-slate-800")}>{s.title}</span>
                      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", s.is_completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                        {s.is_completed ? "Selesai" : TYPE_OPTIONS.find((t) => t.value === s.type)?.label || s.type}
                      </span>
                      {isAdmin && s.store_id ? (
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                          Toko #{s.store_id}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(s.date)}</span>
                      {s.start_time && <span>{s.start_time}{s.end_time ? ` - ${s.end_time}` : ""}</span>}
                      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", priorityDot(s.priority))} />
                      {s.color ? (
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      ) : null}
                    </div>
                    {s.description && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!s.is_completed && (
                      <button onClick={() => handleComplete(s.id)} className="rounded p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Selesai">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    )}
                    <button onClick={() => openEdit(s)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit / Jadwal Ulang">
                      <span className="material-symbols-outlined text-sm">edit_calendar</span>
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {viewMode === "board" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <div key={t.value} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{editingId ? "Edit Jadwal (Reschedule)" : "Jadwal Baru"}</h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Judul *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Judul jadwal..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tipe</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400">
                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Prioritas</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400">
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={form.is_all_day} onChange={(e) => setForm({ ...form, is_all_day: e.target.checked })} className="rounded" />
                  Sepanjang hari
                </label>
              </div>

              {!form.is_all_day && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Mulai</label>
                    <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Jam Selesai</label>
                    <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Warna</label>
                <div className="flex flex-wrap gap-1.5">
                  {["", ...TYPE_OPTIONS.map((t) => t.color)].map((color) => (
                    <button
                      key={color || "default"}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={cn(
                        "h-6 w-6 rounded-full border",
                        color ? "" : "bg-slate-100",
                        (form.color || "") === color ? "ring-2 ring-slate-900 ring-offset-1" : "border-slate-200"
                      )}
                      title={color || "Warna bawaan"}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Catatan..." />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSave} disabled={!form.title.trim() || !form.date || createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
                {editingId ? "Simpan" : "Buat Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}