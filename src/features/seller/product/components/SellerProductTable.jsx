import { memo, useMemo } from "react";
import { formatPrice } from "@/shared/utils/utils";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { TableHeaderFilter } from "@/shared/components/crud/TableHeaderFilter";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const PRODUCT_TABLE_COLUMNS = [
  { key: "product", label: "Produk" },
  { key: "store", label: "Toko", defaultVisible: false },
  { key: "mode", label: "Mode" },
  { key: "price", label: "Harga" },
  { key: "stock", label: "Stok" },
  { key: "status", label: "Status Admin" },
  { key: "active", label: "Status Seller" },
];

const widths = { product: 330, store: 220, mode: 160, price: 170, stock: 130, status: 180, active: 180 };

export const SellerProductTable = memo(function SellerProductTable({
  rows,
  onEdit,
  onToggleActive,
  onStatusChange,
  pendingId,
  portal = "seller",
  columns = PRODUCT_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
  sortBy = "created_at",
  sortDirection = "desc",
  onSortChange,
  columnFilters = {},
  onColumnFilterChange,
  storeOptions = [],
}) {
  const admin = portal === "admin";
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key)) && (column.key !== "store" || admin) && (column.key !== "status" || admin)).map((column) => ({ ...column, width: widths[column.key] || 190 })), [admin, columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: `${portal}.products`, columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);
  const changeFilter = (key) => (value) => onColumnFilterChange?.(key, value);

  const interactiveProps = (column) => ({
    headerProps: layout.getHeaderProps(column.key),
    columnKey: column.key,
    columnStyle: layout.getColumnStyle(column.key),
    onResizeStart: layout.startResize,
    onResetWidth: layout.resetWidth,
    dragging: layout.dragKey === column.key,
    dropTarget: layout.dropKey === column.key,
  });

  const renderHeader = (column) => {
    if (column.rawKey) return <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>;
    if (column.key === "product") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Produk" sortKey="name" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="text" filterValue={columnFilters.product || ""} onFilterChange={changeFilter("product")} placeholder="Cari nama produk" />;
    if (column.key === "store") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Toko" sortKey="store_name" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="select" filterValue={columnFilters.store || ""} onFilterChange={changeFilter("store")} options={storeOptions} />;
    if (column.key === "mode") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Mode" sortKey="mode" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="select" filterValue={columnFilters.mode || ""} onFilterChange={changeFilter("mode")} options={[{ value: "simple", label: "Tanpa Variant" }, { value: "variant", label: "Dengan Variant" }]} />;
    if (column.key === "price") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Harga" sortKey="price" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="range" filterValue={columnFilters.price || { min: "", max: "" }} onFilterChange={changeFilter("price")} minPlaceholder="Harga min" maxPlaceholder="Harga max" />;
    if (column.key === "stock") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Stok" sortKey="stock" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="range" filterValue={columnFilters.stock || { min: "", max: "" }} onFilterChange={changeFilter("stock")} minPlaceholder="Stok min" maxPlaceholder="Stok max" />;
    if (column.key === "status") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Status Admin" sortKey="status" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="select" filterValue={columnFilters.status || ""} onFilterChange={changeFilter("status")} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />;
    return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Status Seller" sortKey="is_active" sortBy={sortBy} sortDirection={sortDirection} onSortChange={onSortChange} filterType="select" filterValue={columnFilters.active || ""} onFilterChange={changeFilter("active")} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Non-Active" }]} />;
  };

  const renderCell = (column, product) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(product.raw?.[column.rawKey])}</td>;
    if (column.key === "product") return <td key={column.key} className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-11 w-11 shrink-0 overflow-hidden bg-slate-100">{product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : null}</div><div className="min-w-0"><p className="truncate font-extrabold text-slate-900">{toTitleCase(product.name)}</p><p className="mt-0.5 truncate text-xs text-slate-500">{product.sku || "SKU otomatis"}</p></div></div></td>;
    if (column.key === "store") return <td key={column.key} className="truncate px-4 py-3 font-bold text-slate-700">{toTitleCase(product.storeName) || "-"}</td>;
    if (column.key === "mode") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{product.mode === "variant" ? `${product.variants.length} variant` : "Tanpa variant"}</td>;
    if (column.key === "price") return <td key={column.key} className="px-4 py-3 font-bold text-slate-800">{formatPrice(product.price)}</td>;
    if (column.key === "stock") return <td key={column.key} className="px-4 py-3 text-slate-600">{product.stock.toLocaleString("id-ID")}</td>;
    if (column.key === "status") return <td key={column.key} className="px-4 py-3"><div onClick={(event) => event.stopPropagation()} className="w-full"><SearchableSelect value={product.status} disabled={pendingId === product.id} onChange={(nextValue) => onStatusChange?.(product, nextValue)} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} clearable={false} buttonClassName="h-8 px-2 text-xs" /></div></td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={product.isActive} pending={pendingId === product.id} onChange={(checked) => onToggleActive?.(product, checked)} compact />{!admin ? <div className="mt-1"><StatusBadge status={product.status} /></div> : null}</td>;
  };

  return (
    <div className="bg-white ring-1 ring-slate-200">
      <TableLayoutHint onReset={layout.resetLayout} />
      <div className="overflow-x-auto pb-1">
        <table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 840), minWidth: "100%" }}>
          <InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} />
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map(renderHeader)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((product) => <tr key={product.id} onClick={() => onEdit(product)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(product.id))} onToggle={() => onToggleRow?.(product.id)} />{layout.orderedColumns.map((column) => renderCell(column, product))}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
});
