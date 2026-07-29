const excludedKeys = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
  "createdAt",
  "updatedAt",
  "deletedAt",
]);

export function humanizeColumnKey(value = "") {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatTableValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) {
    if (!value.length) return "-";
    return value.map((item) => typeof item === "object" ? item.name || item.code || item.id || JSON.stringify(item) : item).join(", ");
  }
  if (typeof value === "object") {
    return value.name || value.code || value.label || JSON.stringify(value);
  }
  return String(value);
}

export function buildRawColumns(rows = [], omittedKeys = []) {
  const omitted = new Set([...excludedKeys, ...omittedKeys]);
  const keys = new Set();
  rows.forEach((row) => {
    const source = row?.raw && typeof row.raw === "object" ? row.raw : row;
    Object.keys(source || {}).forEach((key) => {
      if (!omitted.has(key)) keys.add(key);
    });
  });
  return [...keys].map((key) => ({ key: `raw:${key}`, label: humanizeColumnKey(key), rawKey: key, defaultVisible: false }));
}

export function mergeColumns(baseColumns = [], rawColumns = []) {
  const baseRawKeys = new Set(baseColumns.flatMap((column) => [column.key, column.rawKey]).filter(Boolean));
  return [...baseColumns, ...rawColumns.filter((column) => !baseRawKeys.has(column.rawKey))];
}
