import { useEffect, useDeferredValue, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useAdminCategoryList } from "@/features/admin/category/services/adminCategoryService";
import { getAdminProductError, useAdminProducts, useAdminProductStores, useCreateAdminProduct, useDeleteAdminProduct, useUpdateAdminProduct } from "@/features/admin/product/services/adminProductService";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { PRODUCT_TABLE_COLUMNS, SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { ConfirmDialog, EntityToolbar, ListPageFrame } from "@/shared/components/crud";
import { AsyncState } from "@/shared/components/feedback";
import { InfiniteScrollSentinel } from "@/shared/components/ui/InfiniteScrollSentinel";
import { useColumnVisibility, useEntityEditor, useRefreshOnListActivation, useTableSelection } from "@/shared/hooks";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

const PER_PAGE = 20;
const EMPTY_COLUMN_FILTERS = { product: "", mode: "", price: { min: "", max: "" }, stock: { min: "", max: "", status: "" }, status: "", active: "" };

export default function AdminProductsPage() {
  const [columnFilters, setColumnFilters] = useState(EMPTY_COLUMN_FILTERS);
  const [sort, setSort] = useState({ by: "created_at", direction: "desc" });
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [initialSection, setInitialSection] = useState("general");
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor();
  const tabs = usePanelTabs();
  const notifications = useNotificationCenter();
  const location = useLocation();
  const navigate = useNavigate();
  const productsQuery = useAdminProducts({
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
    ...(columnFilters.status ? { status: columnFilters.status } : {}),
    ...(columnFilters.active ? { is_active: columnFilters.active === "active" } : {}),
    ...(columnFilters.stock.status === "low" ? { low_stock: true } : {}),
    ...(columnFilters.stock.status === "safe" ? { safe_stock: true } : {}),
  });
  const storesQuery = useAdminProductStores();
  const categoriesQuery = useAdminCategoryList();
  const deleteMutation = useDeleteAdminProduct();
  const quickUpdateMutation = useUpdateAdminProduct();
  const isInitialLoading = productsQuery.isLoading && !productsQuery.data;
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: productsQuery.refetch });
  const rows = productsQuery.data?.rows || [];
  const displayRows = useMemo(() => {
    const storesById = new Map((storesQuery.data || []).map((store) => [store.id, store.name]));
    return rows.map((row) => ({ ...row, storeName: storesById.get(row.storeId) || "" }));
  }, [rows, storesQuery.data]);
  const columns = useMemo(() => mergeColumns(PRODUCT_TABLE_COLUMNS.filter((column) => column.key !== "store"), buildRawColumns(displayRows, ["id", "store_id", "name", "thumbnail", "variants", "images", "price", "stock", "status", "is_active"])), [displayRows]);
  const columnVisibility = useColumnVisibility(columns, "admin-products");
  const selection = useTableSelection(displayRows);
  const spreadsheet = useSpreadsheetWorkspace({ module: "product", label: "Product", selectedRows: selection.selectedRows, onCompleted: () => { selection.clear(); productsQuery.refetch(); } });

  const toggleActive = (product, isActive) => {
    quickUpdateMutation.mutate(
      { id: product.id, values: { ...product, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Product", message: `Product berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Product", message: getAdminProductError(error) }),
      },
    );
  };

  const changeStatus = (product, status) => {
    quickUpdateMutation.mutate(
      { id: product.id, values: { ...product, status } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Product", message: `Status Product berhasil diubah menjadi ${status}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Product", message: getAdminProductError(error) }),
      },
    );
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      notifications.push({ type: "success", title: "Product", message: "Product berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Product", message: getAdminProductError(error) });
    }
  };

  const pendingEntity = location.state?.editProduct || null;
  useEffect(() => {
    if (!pendingEntity) return;
    if (tabs?.activeParentId !== "/admin/products") return;
    editor.edit(pendingEntity);
    setInitialSection(location.state?.initialSection || "general");
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEntity, tabs?.activeParentId]);

  useEffect(() => {
    if (!editor.open) setInitialSection("general");
  }, [editor.open]);

  return (
    <AdminShell title="Manajemen Product" subtitle="Kelola product seluruh toko, import/export Excel, gambar, filter header, dan active/non-active.">
      {editor.isListActive ? (
        <ListPageFrame
          toolbar={(
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            onCreate={editor.create}
            onRefresh={() => productsQuery.refetch()}
            refreshing={productsQuery.isFetching}
            createLabel="Tambah Produk"
            placeholder="Cari nama, toko, SKU, brand, atau variant"
            totalCount={productsQuery.data?.meta?.total}
            totalLabel="Produk"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={spreadsheet.actions}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            onApplyDefaultColumns={columnVisibility.applyAsDefault}
            onMoveColumn={columnVisibility.moveColumn}
          />
          )}
        >
          <AsyncState loading={isInitialLoading} error={productsQuery.error ? getAdminProductError(productsQuery.error) : ""} />
          {!isInitialLoading ? (
            <>
              <SellerProductTable
                rows={displayRows}
                isLoading={productsQuery.isFetching && !productsQuery.isFetchingNextPage}
                onEdit={editor.edit}
                onToggleActive={toggleActive}
                onStatusChange={changeStatus}
                pendingId={quickUpdateMutation.variables?.id}
                portal="admin"
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
                onClearAllFilters={() => setColumnFilters(EMPTY_COLUMN_FILTERS)}
                onResetSort={() => setSort({ by: "created_at", direction: "desc" })}
                storeOptions={[]}
                columnOrder={columnVisibility.visibleKeys}
              />
              <InfiniteScrollSentinel hasNextPage={productsQuery.hasNextPage} isFetchingNextPage={productsQuery.isFetchingNextPage} onLoadMore={() => productsQuery.fetchNextPage()} />
            </>
          ) : null}
        </ListPageFrame>
      ) : null}

      <SpreadsheetOperationPanel workspace={spreadsheet} />

      <SellerProductEditor
        open={editor.open}
        product={editor.entity}
        initialSection={initialSection}
        suppressEscape={Boolean(deleteTarget)}
        portal="admin"
        stores={storesQuery.data || []}
        categories={categoriesQuery.data || []}
        useCreateMutation={useCreateAdminProduct}
        useUpdateMutation={useUpdateAdminProduct}
        getError={getAdminProductError}
        onClose={editor.close}
        onDelete={(product) => { setDeleteTarget(product); }}
        onSaved={() => {
          editor.markListDirty();
          notifications.push({ type: "success", title: "Product", message: editor.entity ? "Product berhasil diperbarui." : "Product berhasil ditambahkan." });
          editor.completeSave();
        }}
      />

      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Product" message={`Product “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
