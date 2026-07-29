import { useCallback, useEffect, useMemo, useState } from "react";

function getStorageKey(key) {
  return key ? `ziip:table-columns:${key}` : "";
}

function readStored(storageKey) {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function equalKeys(left, right) {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function useColumnVisibility(columns = [], key = "") {
  const storageKey = getStorageKey(key);
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const defaultKeys = useMemo(
    () => columns.filter((column) => column.defaultVisible !== false).map((column) => column.key),
    [columns],
  );
  const [visibleKeys, setVisibleKeys] = useState(() => readStored(storageKey) || defaultKeys);

  useEffect(() => {
    const allowed = new Set(columnKeys);

    setVisibleKeys((current) => {
      const next = current.filter((columnKey) => allowed.has(columnKey));
      const resolved = next.length ? next : defaultKeys;
      return equalKeys(current, resolved) ? current : resolved;
    });
  }, [columnKeys, defaultKeys]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(visibleKeys));
  }, [storageKey, visibleKeys]);

  const toggleColumn = useCallback((columnKey) => {
    setVisibleKeys((current) => {
      if (current.includes(columnKey)) {
        if (current.length === 1) return current;
        return current.filter((keyValue) => keyValue !== columnKey);
      }
      return [...current, columnKey];
    });
  }, []);

  const showAll = useCallback(() => {
    setVisibleKeys((current) => (equalKeys(current, columnKeys) ? current : columnKeys));
  }, [columnKeys]);

  const reset = useCallback(() => {
    setVisibleKeys((current) => (equalKeys(current, defaultKeys) ? current : defaultKeys));
  }, [defaultKeys]);

  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  return { visibleKeys, visibleSet, toggleColumn, showAll, reset };
}
