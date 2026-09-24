export const TYPE_OPTIONS = [
  { value: "task", label: "Task", color: "#3b82f6" },
  { value: "meeting", label: "Meeting", color: "#8b5cf6" },
  { value: "reminder", label: "Reminder", color: "#f59e0b" },
  { value: "shipment", label: "Shipment", color: "#10b981" },
  { value: "restock", label: "Restock", color: "#ef4444" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", dot: "bg-slate-400" },
  { value: "normal", label: "Normal", dot: "bg-blue-500" },
  { value: "high", label: "High", dot: "bg-amber-500" },
  { value: "urgent", label: "Urgent", dot: "bg-red-500" },
];

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "Tidak berulang" },
  { value: "monthly", label: "Setiap bulan", short: "Bulanan" },
  { value: "yearly", label: "Setiap tahun", short: "Tahunan" },
];

export const STATUS_OPTIONS = [
  { value: "todo", label: "Belum" },
  { value: "in_progress", label: "Sedang Dikerjakan" },
  { value: "done", label: "Selesai" },
];

export function typeColor(type) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.color || "#6b7280";
}

export function priorityDot(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.dot || "bg-slate-400";
}

export function recurrenceLabel(value, short = false) {
  const option = RECURRENCE_OPTIONS.find((r) => r.value === value);
  return short ? option?.short : option?.label;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
