import { memo, useEffect, useMemo, useState } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const CATEGORY_TABLE_COLUMNS = [
  { key: "structure", label: "Struktur Kategori" },
  { key: "level", label: "Level" },
  { key: "catalogGroup", label: "Catalog Group" },
  { key: "parent", label: "Parent", defaultVisible: false },
  { key: "slug", label: "Slug", defaultVisible: false },
  { key: "fullSlug", label: "Full Slug", defaultVisible: false },
  { key: "imageUrl", label: "Gambar", defaultVisible: false },
  { key: "iconUrl", label: "Icon", defaultVisible: false },
  { key: "sortOrder", label: "Urutan", defaultVisible: false },
  { key: "productsCount", label: "Produk" },
  { key: "visibleMenu", label: "Tampil Menu", defaultVisible: false },
  { key: "active", label: "Status" },
];

function getLevel(row) {
  return Number(row.depth ?? Math.max(0, Number(row.level || 1) - 1)) + 1;
}

function LevelBadge({ level }) {
  const className = level === 1
    ? "bg-teal-50 text-teal-700"
    : level === 2
      ? "bg-blue-50 text-blue-700"
      : "bg-violet-50 text-violet-700";
  return <span className={`inline-flex min-w-16 justify-center px-2 py-1 text-[11px] font-extrabold ${className}`}>Level {level}</span>;
}

export const CategoryCrudTable = memo(function CategoryCrudTable({
  rows,
  groupsById,
  onEdit,
  onToggleActive,
  pendingId,
  columns = CATEGORY_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const parentRows = useMemo(() => rows.filter((row) => row.hasChildren || rows.some((candidate) => candidate.parentId === row.id)), [rows]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(parentRows.map((row) => row.id)));
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

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

  const toggle = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          {[1, 2, 3].map((level) => <span key={level} className="bg-white px-2 py-1 ring-1 ring-inset ring-slate-200">Level {level}: {rows.filter((row) => getLevel(row) === level).length}</span>)}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setExpandedIds(new Set(parentRows.map((row) => row.id)))} className="px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50">Buka Semua</button>
          <button type="button" onClick={() => setExpandedIds(new Set())} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">Tutup Semua</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("structure") ? <th className="px-4 py-3">Struktur Kategori</th> : null}
              {visible("level") ? <th className="px-4 py-3">Level</th> : null}
              {visible("catalogGroup") ? <th className="px-4 py-3">Catalog Group</th> : null}
              {visible("parent") ? <th className="px-4 py-3">Parent</th> : null}
              {visible("slug") ? <th className="px-4 py-3">Slug</th> : null}
              {visible("fullSlug") ? <th className="px-4 py-3">Full Slug</th> : null}
              {visible("imageUrl") ? <th className="px-4 py-3">Gambar</th> : null}
              {visible("iconUrl") ? <th className="px-4 py-3">Icon</th> : null}
              {visible("sortOrder") ? <th className="px-4 py-3 text-right">Urutan</th> : null}
              {visible("productsCount") ? <th className="px-4 py-3 text-right">Produk</th> : null}
              {visible("visibleMenu") ? <th className="px-4 py-3">Tampil Menu</th> : null}
              {visible("active") ? <th className="px-4 py-3">Status</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => {
              const level = getLevel(row);
              const hasChildren = row.hasChildren || rows.some((candidate) => candidate.parentId === row.id);
              const expanded = expandedIds.has(row.id);
              return (
                <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                  <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />
                  {visible("structure") ? (
                    <td className="px-4 py-3">
                      <div className="flex min-w-72 items-center" style={{ paddingLeft: `${Math.max(0, level - 1) * 24}px` }}>
                        {hasChildren ? (
                          <button type="button" onClick={(event) => { event.stopPropagation(); toggle(row.id); }} className="mr-2 flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100" aria-label={expanded ? "Tutup child" : "Buka child"}>
                            <span className="material-symbols-outlined text-[18px]">{expanded ? "expand_more" : "chevron_right"}</span>
                          </button>
                        ) : <span className="mr-2 flex h-7 w-7 items-center justify-center text-slate-300">•</span>}
                        <div className="min-w-0">
                          <p className={`${level === 1 ? "font-extrabold" : "font-bold"} truncate text-slate-900`}>{toTitleCase(row.name)}</p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">{row.path || row.fullSlug || row.slug}</p>
                        </div>
                      </div>
                    </td>
                  ) : null}
                  {visible("level") ? <td className="px-4 py-3"><LevelBadge level={level} /></td> : null}
                  {visible("catalogGroup") ? <td className="px-4 py-3 font-bold text-slate-700">{toTitleCase(groupsById[row.catalogGroupId]) || "-"}</td> : null}
                  {visible("parent") ? <td className="px-4 py-3 text-slate-600">{toTitleCase(row.parentName) || "-"}</td> : null}
                  {visible("slug") ? <td className="px-4 py-3 text-slate-500">{row.slug || "-"}</td> : null}
                  {visible("fullSlug") ? <td className="px-4 py-3 text-slate-500">{row.fullSlug || "-"}</td> : null}
                  {visible("imageUrl") ? <td className="px-4 py-3">{row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="h-9 w-9 object-cover" /> : "-"}</td> : null}
                  {visible("iconUrl") ? <td className="px-4 py-3">{row.iconUrl ? <img src={row.iconUrl} alt="" className="h-7 w-7 object-contain" /> : "-"}</td> : null}
                  {visible("sortOrder") ? <td className="px-4 py-3 text-right text-slate-600">{row.sortOrder}</td> : null}
                  {visible("productsCount") ? <td className="px-4 py-3 text-right font-bold text-slate-700">{row.productsCount}</td> : null}
                  {visible("visibleMenu") ? <td className="px-4 py-3 text-slate-600">{row.isVisibleInMenu ? "Ya" : "Tidak"}</td> : null}
                  {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td> : null}
                  {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
