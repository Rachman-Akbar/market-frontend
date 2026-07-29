import { memo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const ADMIN_STORE_COLUMNS = [
  { key: "store", label: "Toko" },
  { key: "owner", label: "Pemilik" },
  { key: "phone", label: "Telepon", defaultVisible: false },
  { key: "email", label: "Email", defaultVisible: false },
  { key: "location", label: "Lokasi" },
  { key: "status", label: "Status Moderasi" },
  { key: "active", label: "Operasional" },
];

export const AdminStoreTable = memo(function AdminStoreTable({
  rows,
  onEdit,
  onToggleActive,
  pendingId,
  columns = ADMIN_STORE_COLUMNS,
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
              {visible("store") ? <th className="px-4 py-3">Toko</th> : null}
              {visible("owner") ? <th className="px-4 py-3">Pemilik</th> : null}
              {visible("phone") ? <th className="px-4 py-3">Telepon</th> : null}
              {visible("email") ? <th className="px-4 py-3">Email</th> : null}
              {visible("location") ? <th className="px-4 py-3">Lokasi</th> : null}
              {visible("status") ? <th className="px-4 py-3">Status Moderasi</th> : null}
              {visible("active") ? <th className="px-4 py-3">Operasional</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((store) => (
              <tr key={store.id} onClick={() => onEdit(store)} className="cursor-pointer hover:bg-slate-50">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(store.id))} onToggle={() => onToggleRow?.(store.id)} />
                {visible("store") ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden bg-slate-100">
                        {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-400">storefront</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-slate-900">{toTitleCase(store.name)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{store.slug}</p>
                      </div>
                    </div>
                  </td>
                ) : null}
                {visible("owner") ? <td className="px-4 py-3 text-slate-600"><p className="font-bold text-slate-700">{toTitleCase(store.ownerName) || "-"}</p><p className="text-xs">{store.ownerEmail || "-"}</p></td> : null}
                {visible("phone") ? <td className="px-4 py-3 text-slate-600">{store.phone || "-"}</td> : null}
                {visible("email") ? <td className="px-4 py-3 text-slate-600">{store.email || "-"}</td> : null}
                {visible("location") ? <td className="px-4 py-3 text-slate-600">{[toTitleCase(store.city), toTitleCase(store.province)].filter(Boolean).join(", ") || "-"}</td> : null}
                {visible("status") ? <td className="px-4 py-3"><StatusBadge status={store.status} /></td> : null}
                {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={store.isActive} pending={pendingId === store.id} disabled={store.status === "suspended"} onChange={(checked) => onToggleActive(store, checked)} compact /></td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(store.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
