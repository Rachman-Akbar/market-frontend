import { useMemo, useState } from "react";

export function useTableSearch(rows = [], keys = []) {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return rows;

    return rows.filter((row) => {
      return keys.some((key) => {
        const value = String(row?.[key] ?? "").toLowerCase();
        return value.includes(normalizedQuery);
      });
    });
  }, [rows, keys, query]);

  return {
    query,
    setQuery,
    filteredRows,
  };
}
