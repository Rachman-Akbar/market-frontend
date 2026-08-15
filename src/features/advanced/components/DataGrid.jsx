import { useMemo } from "react";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";

export function DataGrid({ columns, rows, emptyText = "Data belum tersedia.", onRowClick, actions, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll, storageKey }) {
  const layoutColumns = useMemo(
    () => columns.map((column) => ({ ...column, width: column.width || 170, minWidth: column.minWidth || 96, maxWidth: column.maxWidth || 520 })),
    [columns],
  );
  const tableKey = useMemo(() => storageKey || `advanced.${layoutColumns.map((column) => column.key).join(".")}`, [layoutColumns, storageKey]);
  const layout = useTableColumnLayout({ storageKey: tableKey, columns: layoutColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0) + (actions ? 150 : 0);

  if (!rows.length) return <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{emptyText}</div>;

  return (
    <div className="w-full min-w-0 max-w-full">
      <TableLayoutHint onReset={layout.resetLayout} />
      <div className="w-full min-w-0 max-w-full max-h-[calc(100vh-285px)] overflow-auto border border-slate-200 bg-white">
        <table className="table-fixed border-collapse text-left text-sm" style={{ width: Math.max(tableWidth, 760), minWidth: "100%" }}>
          <InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} trailingWidth={actions ? 150 : 0} />
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {selectionEnabled ? (
                <th className="w-11 border-b border-slate-200 px-3 py-2.5 text-center">
                  <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Pilih semua data" />
                </th>
              ) : null}
              {layout.orderedColumns.map((column) => (
                <InteractiveTableHeader
                  key={column.key}
                  columnKey={column.key}
                  headerProps={layout.getHeaderProps(column.key)}
                  style={layout.getColumnStyle(column.key)}
                  onResizeStart={layout.startResize}
                  onResetWidth={layout.resetWidth}
                  dragging={layout.dragKey === column.key}
                  dropTarget={layout.dropKey === column.key}
                  className="border-b border-slate-200 py-2.5"
                >
                  {column.label}
                </InteractiveTableHeader>
              ))}
              {actions ? <th className="sticky right-0 border-b border-slate-200 bg-slate-100 px-3 py-2.5 text-right font-extrabold">Aksi</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer hover:bg-emerald-50/40" : "hover:bg-slate-50"}>
                {selectionEnabled ? (
                  <td className="px-3 py-2.5 text-center" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(String(row.id)) || selectedIds.has(Number(row.id))} onChange={() => onToggleRow?.(row.id)} aria-label={`Pilih data ${row.id}`} />
                  </td>
                ) : null}
                {layout.orderedColumns.map((column) => <td key={column.key} className="overflow-hidden px-3 py-2.5 align-top text-slate-700"><div className="truncate">{column.render ? column.render(row) : String(row[column.key] ?? "-")}</div></td>)}
                {actions ? <td className="sticky right-0 whitespace-nowrap bg-white px-3 py-2.5 text-right" onClick={(event) => event.stopPropagation()}>{actions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
