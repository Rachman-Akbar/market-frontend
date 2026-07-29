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

export function useColumnVisibility(columns = [], key = "") {
  const storageKey = getStorageKey(key);
  const defaultKeys = useMemo(
    () => columns.filter((column) => column.defaultVisible !== false).map((column) => column.key),
    [columns],
  );
  const [visibleKeys, setVisibleKeys] = useState(() => readStored(storageKey) || defaultKeys);

  useEffect(() => {
    const allowed = new Set(columns.map((column) => column.key));
    setVisibleKeys((current) => {
      const next = current.filter((columnKey) => allowed.has(columnKey));
      defaultKeys.forEach((columnKey) => {
        if (!next.length && !next.includes(columnKey)) next.push(columnKey);
      });
      return next.length ? next : defaultKeys;
    });
  }, [columns, defaultKeys]);

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

  const showAll = useCallback(() => setVisibleKeys(columns.map((column) => column.key)), [columns]);
  const reset = useCallback(() => setVisibleKeys(defaultKeys), [defaultKeys]);
  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  return { visibleKeys, visibleSet, toggleColumn, showAll, reset };
}
