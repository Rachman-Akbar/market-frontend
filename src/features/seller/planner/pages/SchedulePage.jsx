import { useState, useRef, useCallback, useMemo } from "react";
import {
  useSchedules,
  useGrid,
  useDeleteSchedule,
  useCompleteSchedule,
  plannerError,
} from "../services/plannerService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useStoreContextStores } from "@/features/admin/storeContext/services/adminStoreContextService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { cn } from "@/shared/utils/utils";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { toolbarControlClassName } from "@/shared/components/crud/toolbarControlClassName";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useListTotalCount } from "@/shared/hooks/useListTotalCount";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";
import {
  TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  typeColor,
  priorityDot,
  recurrenceLabel,
} from "../constants";
import { ScheduleForm } from "../components/ScheduleForm";
import KanbanBoard from "../components/KanbanBoard";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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

function shade(hex, percent) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const SWIPE_THRESHOLD = 60;

export default function SchedulePage() {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === "admin";

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState(isAdmin ? "board" : "kanban");
  const [createDefaults, setCreateDefaults] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStoreId, setFilterStoreId] = useState("");
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [slideDir, setSlideDir] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const calendarRef = useRef(null);
  const swipeStartX = useRef(null);

  const editor = useEntityEditor({
    getEditLabel: (entity) => entity?.title || "Jadwal",
  });

  const storesQuery = useStoreContextStores({ search: undefined, per_page: 100 }, isAdmin);
  const adminStores = storesQuery.data?.rows || [];

  const queryParams = useMemo(() => {
    const p = { per_page: 100 };
    if (filterType) p.type = filterType;
    if (filterPriority) p.priority = filterPriority;
    if (isAdmin && filterStoreId) p.store_id = filterStoreId;
    return p;
  }, [filterType, filterPriority, filterStoreId, isAdmin]);

  const { data: gridData, isLoading: gridLoading, refetch: refetchGrid } = useGrid(year, month, isAdmin && filterStoreId ? { store_id: filterStoreId } : {});
  const { data: listData, isLoading: listLoading, refetch: refetchList } = useSchedules(queryParams);
  const deleteMutation = useDeleteSchedule();
  const completeMutation = useCompleteSchedule();

  const refetchAll = useCallback(() => {
    refetchList();
    refetchGrid();
  }, [refetchGrid, refetchList]);

  useRefreshOnListActivation({
    isListActive: editor.isListActive,
    listRevision: editor.listRevision,
    refetch: refetchAll,
  });

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

  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today = todayString();

  const extraCreatePayload = useMemo(
    () => (isAdmin && filterStoreId ? { store_id: Number(filterStoreId) } : null),
    [filterStoreId, isAdmin]
  );

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

  const openCreate = (defaults = null) => {
    setCreateDefaults(defaults);
    editor.create();
  };

  const openEdit = (schedule) => {
    editor.edit(schedule);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      editor.markListDirty();
      if (editor.open) editor.completeSave();
      toastSuccess("Jadwal dihapus.");
    } catch (e) {
      toastError("Gagal menghapus jadwal", plannerError(e));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeMutation.mutateAsync(id);
      toastSuccess("Jadwal ditandai selesai.");
    } catch (e) {
      toastError("Gagal menyelesaikan jadwal", plannerError(e));
    }
  };

  const handleExport = useCallback(async () => {
    if (!calendarRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
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
    } catch {
      toastError("Gagal export gambar.");
    } finally {
      setExporting(false);
    }
  }, [year, month]);

  const monthLabel = new Date(year, month - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const normalizedQuery = query.trim().toLowerCase();
  const listItems = useMemo(() => {
    const rows = listData?.rows || listData || [];
    if (!normalizedQuery) return rows;
    return rows.filter((s) => [s.title, s.description, s.type].some((value) => String(value || "").toLowerCase().includes(normalizedQuery)));
  }, [listData, normalizedQuery]);

  const totalSchedules = useListTotalCount(listData?.meta, { fallbackTotal: listItems.length, label: "Jadwal" });

  const scheduleColumns = [
    {
      key: "title",
      label: "Jadwal",
      width: 280,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color || typeColor(row.type) }} />
          <span className={cn("truncate font-medium", row.is_completed ? "text-slate-400 line-through" : "text-slate-800")}>{row.title}</span>
        </div>
      ),
    },
    { key: "type", label: "Tipe", filterType: "select", options: TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label })) },
    { key: "date", label: "Tanggal", filterable: false, render: (row) => formatDate(row.date) },
    {
      key: "time",
      label: "Waktu",
      filterable: false,
      render: (row) => {
        if (row.start_time) return row.end_time ? `${row.start_time} - ${row.end_time}` : row.start_time;
        return row.is_all_day ? "Sepanjang hari" : "-";
      },
    },
    {
      key: "priority",
      label: "Prioritas",
      filterType: "select",
      options: PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("inline-block h-2 w-2 rounded-full", priorityDot(row.priority))} />
          {PRIORITY_OPTIONS.find((p) => p.value === row.priority)?.label || row.priority || "-"}
        </span>
      ),
    },
    {
      key: "recurrence",
      label: "Pengulangan",
      filterable: false,
      render: (row) => (row.recurrence && row.recurrence !== "none" ? recurrenceLabel(row.recurrence) : "-"),
    },
    { key: "description", label: "Catatan", filterable: false, render: (row) => row.description || "-" },
    {
      key: "is_completed",
      label: "Status",
      filterable: false,
      render: (row) => (row.is_completed ? "Selesai" : "Belum"),
    },
    ...(isAdmin ? [{ key: "store_id", label: "Toko", filterable: false, render: (row) => (row.store_id ? `Toko #${row.store_id}` : "-") }] : []),
    {
      key: "actions",
      label: "Aksi",
      filterable: false,
      width: 132,
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
          {!row.is_completed ? (
            <button type="button" title="Selesai" onClick={() => handleComplete(row.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><span className="material-symbols-outlined text-[17px]">check_circle</span></button>
          ) : null}
          <button type="button" title="Edit / Jadwal Ulang" onClick={() => openEdit(row)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"><span className="material-symbols-outlined text-[17px]">edit_calendar</span></button>
          <button type="button" title="Hapus" onClick={() => setDeleteTarget(row)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"><span className="material-symbols-outlined text-[17px]">delete</span></button>
        </div>
      ),
    },
  ];

  const scheduleActions = [
    { key: "export-image", label: "Export Gambar", icon: "download", requiresSelection: false, disabled: exporting, onClick: handleExport },
  ];

  const filters = (
    <>
      <div className="flex h-9 shrink-0 items-center gap-1 rounded-[10px] border border-slate-300 bg-white px-1.5">
        <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center text-slate-600 transition-colors hover:bg-slate-100" title="Bulan sebelumnya">&lsaquo;</button>
        <span className="min-w-[140px] text-center text-sm font-bold text-slate-800">{monthLabel}</span>
        <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center text-slate-600 transition-colors hover:bg-slate-100" title="Bulan berikutnya">&rsaquo;</button>
        <button type="button" onClick={goToday} className="ml-1 h-7 shrink-0 rounded-[10px] bg-slate-100 px-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200">Hari ini</button>
      </div>
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={toolbarControlClassName} aria-label="Filter tipe jadwal">
        <option value="">Semua Tipe</option>
        {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={toolbarControlClassName} aria-label="Filter prioritas jadwal">
        <option value="">Semua Prioritas</option>
        {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      {isAdmin ? (
        <select value={filterStoreId} onChange={(e) => setFilterStoreId(e.target.value)} className={toolbarControlClassName} aria-label="Filter toko jadwal">
          <option value="">Jadwal Saya (Admin)</option>
          {adminStores.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
        </select>
      ) : null}
    </>
  );

  return (
    <>
      {editor.isListActive ? (
        <ModuleFrame
          query={query}
          onQueryChange={setQuery}
          onRefresh={refetchAll}
          onCreate={() => openCreate()}
          createLabel="Jadwal"
          placeholder="Cari jadwal berdasarkan judul, tipe, atau catatan..."
          filters={filters}
          bulkActions={scheduleActions}
          totalCount={totalSchedules.totalCount}
          totalLabel={totalSchedules.totalLabel}
          totalTitle={totalSchedules.totalTitle}
        >
          <style>{`
            @keyframes slide-in-right { from { transform: translateX(48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slide-in-left { from { transform: translateX(-48px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .schedule-slide { animation-duration: 260ms; animation-timing-function: ease-out; }
            .schedule-slide-right { animation-name: slide-in-left; }
            .schedule-slide-left { animation-name: slide-in-right; }
          `}</style>

          <div className="flex flex-wrap gap-[5px] border-b border-slate-200 pb-3">
            {[
              ["kanban", "Papan", "view_kanban"],
              ["board", "Kalender", "calendar_month"],
              ["table", "Tabel", "table_rows"],
            ].map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition",
                  viewMode === id
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {viewMode === "kanban" ? (
            <KanbanBoard
              isAdmin={isAdmin}
              filterStoreId={filterStoreId}
              filterType={filterType}
              filterPriority={filterPriority}
              onCreate={openCreate}
              onEdit={openEdit}
            />
          ) : viewMode === "table" ? (
            <DataGrid
              storageKey="planner.schedules"
              onFilterStateChange={totalSchedules.onFilterStateChange}
              columns={scheduleColumns}
              rows={listItems}
              emptyText={listLoading ? "" : "Belum ada jadwal."}
              onRowClick={openEdit}
            />
          ) : (
            <>
              <div ref={calendarRef} className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
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
                      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                        {WEEKDAYS.map((w) => (
                          <div
                            key={w}
                            className={cn(
                              "px-2 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wider",
                              w === "Min" ? "text-rose-500" : w === "Sab" ? "text-sky-500" : "text-slate-500"
                            )}
                          >
                            {w}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7">
                        {Array.from({ length: startDay }).map((_, i) => (
                          <div key={`empty-${i}`} className="min-h-[104px] border-b border-r border-slate-200/80 bg-slate-50/60" />
                        ))}
                        {Array.from({ length: days }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = toDateString(year, month, day);
                          const isToday = dateStr === today;
                          const weekday = (startDay + i) % 7;
                          const isWeekend = weekday === 0 || weekday === 6;
                          const daySchedules = schedulesByDate[dateStr] || [];
                          return (
                            <div
                              key={day}
                              className={cn(
                                "min-h-[104px] border-b border-r border-slate-200/80 p-1.5 transition",
                                isToday
                                  ? "bg-emerald-50/80 ring-2 ring-inset ring-emerald-400"
                                  : isWeekend
                                    ? "bg-slate-50/80 hover:bg-slate-100/70"
                                    : "bg-white hover:bg-emerald-50/40"
                              )}
                              onDoubleClick={() => openCreate({ date: dateStr })}
                              title="Klik ganda untuk menambah jadwal"
                            >
                              <div className="mb-1 flex items-center justify-between gap-1">
                                <span className={cn(
                                  "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                                  isToday
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-300"
                                    : "text-slate-600"
                                )}>
                                  {day}
                                </span>
                                {daySchedules.length > 0 ? (
                                  <span className={cn(
                                    "rounded-full px-1.5 py-px text-[9px] font-extrabold leading-4 text-white",
                                    isToday ? "bg-emerald-600" : "bg-slate-700"
                                  )}>
                                    {daySchedules.length}
                                  </span>
                                ) : null}
                              </div>
                              <div className="space-y-1">
                                {daySchedules.slice(0, 3).map((s) => {
                                  const color = s.color || typeColor(s.type);
                                  return (
                                    <div
                                      key={s.id}
                                      onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                                      className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold leading-tight text-white shadow-sm transition hover:brightness-110 hover:shadow"
                                      style={{
                                        backgroundColor: color,
                                        backgroundImage: `linear-gradient(135deg, ${shade(color, 18)} 0%, ${color} 55%, ${shade(color, -14)} 100%)`,
                                        boxShadow: `0 1px 2px ${color}66`,
                                      }}
                                      title={`${s.title}${s.start_time ? ` • ${s.start_time}` : ""}`}
                                    >
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
                                      {s.start_time && <span className="shrink-0 tabular-nums opacity-90">{s.start_time}</span>}
                                      {s.recurrence && s.recurrence !== "none" && (
                                        <span className="material-symbols-outlined text-[10px]" title={recurrenceLabel(s.recurrence)}>repeat</span>
                                      )}
                                      <span className="truncate">{s.title}</span>
                                      {s.priority === "urgent" ? (
                                        <span className="material-symbols-outlined shrink-0 text-[11px] font-bold" title="Prioritas urgent">priority_high</span>
                                      ) : null}
                                    </div>
                                  );
                                })}
                                {daySchedules.length > 3 ? (
                                  <div className="rounded-md bg-slate-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-slate-500 transition hover:bg-slate-200">
                                    +{daySchedules.length - 3} lainnya
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                        {Array.from({ length: (7 - ((startDay + days) % 7)) % 7 }).map((_, i) => (
                          <div key={`end-${i}`} className="min-h-[104px] border-b border-r border-slate-200/80 bg-slate-50/60" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-slate-200 bg-slate-50/80 px-3 py-1.5 text-center text-[10px] font-medium text-slate-400">
                    Geser papan ke kiri/kanan untuk berganti bulan &bull; Klik ganda hari untuk tambah jadwal
                  </div>
                </div>
              </div>

              {viewMode === "board" ? (
                <div className="mt-3 flex flex-wrap items-center gap-[5px]">
                  {TYPE_OPTIONS.map((t) => (
                    <span
                      key={t.value}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 bg-white px-3 py-1 text-[11px] font-bold"
                      style={{ borderColor: `${t.color}55`, color: t.color }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                    Hari ini
                  </span>
                </div>
              ) : null}
            </>
          )}
        </ModuleFrame>
      ) : null}

      <ScheduleForm
        open={editor.open}
        entity={editor.entity}
        defaultValues={editor.entity ? null : createDefaults}
        extraCreatePayload={extraCreatePayload}
        onDelete={(entity) => setDeleteTarget(entity)}
        onClose={() => {
          setCreateDefaults(null);
          editor.close();
        }}
        onSaved={() => {
          setCreateDefaults(null);
          editor.markListDirty();
          editor.completeSave();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Jadwal"
        message={`Jadwal ${deleteTarget?.title ? `“${deleteTarget.title}” ` : ""}akan dihapus dari planner.`}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
      />
    </>
  );
}
