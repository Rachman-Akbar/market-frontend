import { memo, useEffect, useMemo, useState } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { toTitleCase } from "@/shared/utils/textFormatter";

function getLevel(row) {
  return Number(row.depth ?? Math.max(0, Number(row.level || 1) - 1)) + 1;
}

function LevelBadge({ level }) {
  const className = level === 1
    ? "bg-teal-50 text-teal-700"
    : level === 2
      ? "bg-blue-50 text-blue-700"
      : "bg-violet-50 text-violet-700";

  return <span className={`inline-flex min-w-16 justify-center rounded-md px-2 py-1 text-[11px] font-extrabold ${className}`}>Level {level}</span>;
}

export const CategoryCrudTable = memo(function CategoryCrudTable({ rows, groupsById, onEdit, onDelete }) {
  const parentRows = useMemo(() => rows.filter((row) => row.hasChildren || rows.some((candidate) => candidate.parentId === row.id)), [rows]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(parentRows.map((row) => row.id)));

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set(current);
      parentRows.forEach((row) => next.add(row.id));
      return next;
    });
  }, [parentRows]);

  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const visibleRows = useMemo(() => rows.filter((row) => {
    let parentId = row.parentId;
    while (parentId) {
      const parent = rowsById.get(parentId);
      if (!parent) break;
      if (!expandedIds.has(parentId)) return false;
      parentId = parent.parentId || null;
    }
    return true;
  }), [expandedIds, rows, rowsById]);

  const counts = useMemo(() => rows.reduce((result, row) => {
    const level = getLevel(row);
    result[level] = (result[level] || 0) + 1;
    return result;
  }, {}), [rows]);

  const toggle = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(parentRows.map((row) => row.id)));
  const collapseAll = () => setExpandedIds(new Set());

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          {[1, 2, 3].map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-inset ring-slate-200">
              <span>Level {level}</span>
              <strong className="text-slate-900">{counts[level] || 0}</strong>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={expandAll} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50">Buka Semua</button>
          <button type="button" onClick={collapseAll} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Tutup Semua</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100/80 text-xs font-extrabold text-slate-600">
            <tr>
              <th className="px-4 py-3">Struktur Kategori</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Catalog Group</th>
              <th className="px-4 py-3 text-right">Produk</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => {
              const level = getLevel(row);
              const hasChildren = row.hasChildren || rows.some((candidate) => candidate.parentId === row.id);
              const expanded = expandedIds.has(row.id);

              return (
                <tr key={row.id} className={level === 1 ? "bg-slate-50/40 hover:bg-slate-50" : "hover:bg-slate-50/70"}>
                  <td className="px-4 py-3">
                    <div className="flex min-w-72 items-start" style={{ paddingLeft: `${Math.max(0, level - 1) * 24}px` }}>
                      <span className="relative mr-2 flex h-8 w-8 shrink-0 items-center justify-center">
                        {level > 1 ? <span className="absolute -left-3 top-0 h-4 w-4 border-b border-l border-slate-300" /> : null}
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggle(row.id)}
                            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            aria-label={expanded ? "Tutup child kategori" : "Buka child kategori"}
                            aria-expanded={expanded}
                          >
                            <span className="material-symbols-outlined text-[18px]">{expanded ? "expand_more" : "chevron_right"}</span>
                          </button>
                        ) : (
                          <span className="relative z-10 h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className={`truncate text-sm text-slate-900 ${level === 1 ? "font-extrabold" : "font-bold"}`}>{toTitleCase(row.name)}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{row.pathNames?.map(toTitleCase).join(" / ") || row.fullSlug || row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><LevelBadge level={level} /></td>
                  <td className="px-4 py-3 text-slate-600">{toTitleCase(groupsById[row.catalogGroupId]) || "-"}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{row.productsCount.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={row.isActive ? "active" : "inactive"} />
                      {!row.isVisibleInMenu ? <StatusBadge status="inactive" label="Menu hidden" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3"><RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
