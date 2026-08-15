import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { PRODUCT_TABLE_COLUMNS, SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";
import { getSellerProductError, useDeleteSellerProduct, useSellerProducts, useUpdateSellerProduct } from "@/features/seller/product/services/sellerProductService";

const PER_PAGE = 20;
const EMPTY_COLUMN_FILTERS = { product: "", mode: "", price: { min: "", max: "" }, stock: { min: "", max: "" }, active: "" };

export default function SellerProductsPage() {
  const [columnFilters, setColumnFilters] = useState(EMPTY_COLUMN_FILTERS);
  const [sort, setSort] = useState({ by: "created_at", direction: "desc" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor();
  const notifications = useNotificationCenter();
  const productsQuery = useSellerProducts({
    page,
    per_page: PER_PAGE,
    sort_by: sort.by,
    sort_direction: sort.direction,
    ...(deferredQuery ? { search: deferredQuery } : {}),
    ...(columnFilters.product ? { name: columnFilters.product } : {}),
    ...(columnFilters.mode ? { mode: columnFilters.mode } : {}),
    ...(columnFilters.price.min !== "" ? { price_min: columnFilters.price.min } : {}),
    ...(columnFilters.price.max !== "" ? { price_max: columnFilters.price.max } : {}),
    ...(columnFilters.stock.min !== "" ? { stock_min: columnFilters.stock.min } : {}),
    ...(columnFilters.stock.max !== "" ? { stock_max: columnFilters.stock.max } : {}),
    ...(columnFilters.active ? { is_active: columnFilters.active === "active" } : {}),
  });
  const deleteMutation = useDeleteSellerProduct();
  const quickUpdateMutation = useUpdateSellerProduct();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: productsQuery.refetch });
  const rows = productsQuery.data?.rows || [];
  const meta = productsQuery.data?.meta || {};
  const columns = useMemo(() => mergeColumns(PRODUCT_TABLE_COLUMNS.filter((column) => column.key !== "store" && column.key !== "status"), buildRawColumns(rows, ["id", "store_id", "name", "thumbnail", "variants", "images", "price", "stock", "status", "is_active"])), [rows]);
  const columnVisibility = useColumnVisibility(columns, "seller-products");
  const selection = useTableSelection(rows);
  const spreadsheet = useSpreadsheetWorkspace({ module: "product", label: "Product", selectedRows: selection.selectedRows, onCompleted: () => { selection.clear(); productsQuery.refetch(); } });
  const hppSpreadsheet = useSpreadsheetWorkspace({ module: "product-costing", label: "HPP & Harga Jual", allowBulkDelete: false, onCompleted: () => productsQuery.refetch() });
  const spreadsheetActions = [...spreadsheet.actions, ...hppSpreadsheet.actions];
  const activeSpreadsheet = spreadsheet.activeOperation?.payload?.module === "product-costing" ? hppSpreadsheet : spreadsheet;
  const hasActiveFilters = useMemo(() => JSON.stringify(columnFilters) !== JSON.stringify(EMPTY_COLUMN_FILTERS), [columnFilters]);

  useEffect(() => setPage(1), [columnFilters, deferredQuery, sort]);

  const toggleActive = (product, isActive) => {
    quickUpdateMutation.mutate(
      { id: product.id, values: { ...product, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Product", message: `Product berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Product", message: getSellerProductError(error) }),
      },
    );
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      notifications.push({ type: "success", title: "Product", message: "Product berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Product", message: getSellerProductError(error) });
    }
  };

  return (
    <SellerPanelShell title="Produk Toko" subtitle="Kelola product, variant, gambar, harga, status, serta import/export. Saldo stok dikelola terpisah melalui Persediaan.">
      {editor.isListActive ? (
        <>
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            onCreate={editor.create}
            onRefresh={() => productsQuery.refetch()}
            refreshing={productsQuery.isFetching}
            createLabel="Tambah Produk"
            placeholder="Cari nama, toko, SKU, brand, atau variant"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={spreadsheetActions}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => setColumnFilters(EMPTY_COLUMN_FILTERS)}
          />
          <AsyncState loading={productsQuery.isLoading} error={productsQuery.error ? getSellerProductError(productsQuery.error) : ""} />
          {!productsQuery.isLoading ? (
            <>
              <SellerProductTable
                rows={rows}
                onEdit={editor.edit}
                onToggleActive={toggleActive}
                pendingId={quickUpdateMutation.variables?.id}
                portal="seller"
                columns={columns}
                visibleSet={columnVisibility.visibleSet}
                selectionEnabled={selection.enabled}
                selectedIds={selection.selectedIds}
                allSelected={selection.allSelected}
                onToggleRow={selection.toggleRow}
                onToggleAll={selection.toggleAll}
                sortBy={sort.by}
                sortDirection={sort.direction}
                onSortChange={(by, direction) => setSort({ by, direction })}
                columnFilters={columnFilters}
                onColumnFilterChange={(key, value) => setColumnFilters((current) => ({ ...current, [key]: value }))}
              />
              {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
            </>
          ) : null}
        </>
      ) : null}

      <SpreadsheetOperationPanel workspace={activeSpreadsheet} />

      <SellerProductEditor
        open={editor.open}
        product={editor.entity}
        onClose={editor.close}
        onDelete={(product) => { setDeleteTarget(product); editor.close(); }}
        onSaved={() => {
          editor.markListDirty();
          notifications.push({ type: "success", title: "Product", message: editor.entity ? "Product berhasil diperbarui." : "Product berhasil ditambahkan." });
          editor.completeSave();
        }}
      />

      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Product" message={`Product “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </SellerPanelShell>
  );
}
