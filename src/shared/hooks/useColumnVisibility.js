import { useCallback, useEffect, useMemo, useState } from "react";

const COLUMNS_CHANGED_EVENT = "ziip:columns-changed";

function getStorageKey(key) {
  return key ? `ziip:table-columns:${key}` : "";
}

function getDefaultStorageKey(key) {
  return key ? `ziip:table-columns-default:${key}` : "";
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

function clearStored(storageKey) {
  if (!storageKey || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore storage errors
  }
}

function persistStored(storageKey, keys) {
  if (!storageKey || typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(keys);
    if (window.localStorage.getItem(storageKey) === serialized) return;
    window.localStorage.setItem(storageKey, serialized);
    window.dispatchEvent(new CustomEvent(COLUMNS_CHANGED_EVENT, { detail: { storageKey } }));
  } catch {
    // ignore storage errors
  }
}

function equalKeys(left, right) {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

function uniqueKeys(keys) {
  return [...new Set(keys)];
}

export function useColumnVisibility(columns = [], key = "") {
  const storageKey = getStorageKey(key);
  const defaultStorageKey = getDefaultStorageKey(key);
  const columnKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const lockedKeys = useMemo(() => columns.filter((column) => column.locked).map((column) => column.key), [columns]);
  const defaultKeys = useMemo(
    () => columns.filter((column) => column.defaultVisible !== false || column.locked).map((column) => column.key),
    [columns],
  );
  const lockedKeySet = useMemo(() => new Set(lockedKeys), [lockedKeys]);

  const sanitize = useCallback((keys) => {
    const allowed = new Set(columnKeys);
    const selected = (Array.isArray(keys) ? keys : []).filter((columnKey) => allowed.has(columnKey));
    const resolved = uniqueKeys([...selected, ...lockedKeys]);
    if (!resolved.length) return [...defaultKeys];
    return resolved;
  }, [columnKeys, defaultKeys, lockedKeys]);

  const [visibleKeys, setVisibleKeys] = useState(() => {
    const defaultOverride = readStored(defaultStorageKey);
    if (Array.isArray(defaultOverride) && defaultOverride.length) return sanitize(defaultOverride);
    return sanitize(readStored(storageKey) || defaultKeys);
  });

  useEffect(() => {
    setVisibleKeys((current) => {
      const resolved = sanitize(current);
      return equalKeys(current, resolved) ? current : resolved;
    });
  }, [sanitize]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return undefined;
    persistStored(storageKey, visibleKeys);
    return undefined;
  }, [storageKey, visibleKeys]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return undefined;
    const handler = (event) => {
      const changedKey = event?.detail?.storageKey;
      if (changedKey && changedKey !== storageKey) return;
      const stored = readStored(storageKey);
      if (!stored) return;
      setVisibleKeys((current) => {
        const resolved = sanitize(stored);
        return equalKeys(current, resolved) ? current : resolved;
      });
    };
    window.addEventListener(COLUMNS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(COLUMNS_CHANGED_EVENT, handler);
  }, [storageKey, sanitize]);

  const toggleColumn = useCallback((columnKey) => {
    if (lockedKeySet.has(columnKey)) return;
    setVisibleKeys((current) => {
      if (current.includes(columnKey)) {
        if (current.length === 1) return current;
        return current.filter((keyValue) => keyValue !== columnKey);
      }
      return [...current, columnKey];
    });
  }, [lockedKeySet]);

  const showAll = useCallback(() => {
    setVisibleKeys((current) => (equalKeys(current, columnKeys) ? current : columnKeys));
  }, [columnKeys]);

  const applyAsDefault = useCallback(() => {
    if (!defaultStorageKey || typeof window === "undefined") return;
    window.localStorage.setItem(defaultStorageKey, JSON.stringify(visibleKeys));
  }, [defaultStorageKey, visibleKeys]);

  const reset = useCallback(() => {
    clearStored(defaultStorageKey);
    clearStored(storageKey);
    setVisibleKeys((current) => (equalKeys(current, defaultKeys) ? current : defaultKeys));
  }, [defaultKeys, defaultStorageKey, storageKey]);

  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  return { visibleKeys, visibleSet, toggleColumn, showAll, applyAsDefault, reset };
}