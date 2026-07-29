import { memo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const CATALOG_GROUP_COLUMNS = [
  { key: "name", label: "Nama" },
  { key: "slug", label: "Slug" },
  { key: "active", label: "Status" },
];

export const CatalogGroupCrudTable = memo(function CatalogGroupCrudTable({
  rows,
  onEdit,
  onToggleActive,
  pendingId,
  columns = CATALOG_GROUP_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("name") ? <th className="px-4 py-3">Nama</th> : null}
              {visible("slug") ? <th className="px-4 py-3">Slug</th> : null}
              {visible("active") ? <th className="px-4 py-3">Status</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />
                {visible("name") ? <td className="px-4 py-3 font-extrabold text-slate-900">{toTitleCase(row.name)}</td> : null}
                {visible("slug") ? <td className="px-4 py-3 text-slate-500">{row.slug}</td> : null}
                {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
