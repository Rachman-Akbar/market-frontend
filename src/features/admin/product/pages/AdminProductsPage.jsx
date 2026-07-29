import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useAdminCategoryList } from "@/features/admin/category/services/adminCategoryService";
import {
  getAdminProductError,
  useAdminProducts,
  useAdminProductStores,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from "@/features/admin/product/services/adminProductService";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { PRODUCT_TABLE_COLUMNS, SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { ConfirmDialog, EntityToolbar } from "@/shared/components/crud";
import { AsyncState } from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/ui/Pagination";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { useColumnVisibility, useEntityEditor, useRefreshOnListActivation, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

const PER_PAGE = 20;

export default function AdminProductsPage() {
  const [activeFilter, setActiveFilter] = useState("");
  const [publicationStatus, setPublicationStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor();
  const productsQuery = useAdminProducts({
    page,
    per_page: PER_PAGE,
    ...(deferredQuery ? { search: deferredQuery } : {}),
    ...(activeFilter ? { is_active: activeFilter === "active" } : {}),
    ...(publicationStatus ? { status: publicationStatus } : {}),
  });
  const storesQuery = useAdminProductStores();
  const categoriesQuery = useAdminCategoryList();
  const deleteMutation = useDeleteAdminProduct();
  const quickUpdateMutation = useUpdateAdminProduct();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: productsQuery.refetch });
  const rows = productsQuery.data?.rows || [];
  const meta = productsQuery.data?.meta || {};

  const displayRows = useMemo(() => {
    const storesById = new Map(
      (storesQuery.data || []).map((store) => [store.id, store.name]),
    );

    return rows.map((row) => ({
      ...row,
      storeName: storesById.get(row.storeId) || "",
    }));
  }, [rows, storesQuery.data]);

  const columns = useMemo(
    () => mergeColumns(PRODUCT_TABLE_COLUMNS, buildRawColumns(displayRows, ["id", "store_id", "name", "thumbnail", "variants", "images", "price", "stock", "status", "is_active"])),
    [displayRows],
  );
  const columnVisibility = useColumnVisibility(columns, "admin-products");
  const selection = useTableSelection(displayRows);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, deferredQuery, publicationStatus]);

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const product of selection.selectedRows) await deleteMutation.mutateAsync(product.id);
      selection.clear();
      setMessage("Produk terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getAdminProductError(error));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Produk berhasil dihapus.");
    } catch (error) {
      setMessage(getAdminProductError(error));
    }
  };

  return (
    <AdminShell
      title="Manajemen Produk"
      subtitle="Kelola produk seluruh toko, mode variant, galeri, status publikasi, serta active/non-active."
    >
      {editor.isListActive ? (<>

      <EntityToolbar
        query={query}
        onQueryChange={setQuery}
        onCreate={editor.create}
        onRefresh={() => productsQuery.refetch()}
        refreshing={productsQuery.isFetching}
        createLabel="Tambah Produk"
        placeholder="Cari nama, SKU, brand, atau variant"
        selectionEnabled={selection.enabled}
        selectedCount={selection.selectedCount}
        onToggleSelection={selection.toggleEnabled}
        bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]}
        columns={columns}
        visibleColumns={columnVisibility.visibleKeys}
        onToggleColumn={columnVisibility.toggleColumn}
        onShowAllColumns={columnVisibility.showAll}
        onResetColumns={columnVisibility.reset}
        filters={(
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <SearchableSelect
              value={publicationStatus}
              onChange={setPublicationStatus}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              placeholder="Semua publikasi"
              className="w-44"
              buttonClassName="h-10"
            />
            <SearchableSelect
              value={activeFilter}
              onChange={setActiveFilter}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Non-Active" },
              ]}
              placeholder="Semua active"
              className="w-40"
              buttonClassName="h-10"
            />
          </div>
        )}
      />

      {message ? (
        <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
          {message}
        </p>
      ) : null}

      <AsyncState
        loading={productsQuery.isLoading}
        error={productsQuery.error ? getAdminProductError(productsQuery.error) : ""}
        empty={!productsQuery.isLoading && !displayRows.length}
        emptyText="Produk belum tersedia."
      />

      {displayRows.length ? (
        <>
          <SellerProductTable
            rows={displayRows}
            onEdit={editor.edit}
            onToggleActive={(product, isActive) => quickUpdateMutation.mutate({ id: product.id, values: { ...product, isActive } })}
            onStatusChange={(product, statusValue) => quickUpdateMutation.mutate({ id: product.id, values: { ...product, status: statusValue } })}
            pendingId={quickUpdateMutation.variables?.id}
            portal="admin"
            columns={columns}
            visibleSet={columnVisibility.visibleSet}
            selectionEnabled={selection.enabled}
            selectedIds={selection.selectedIds}
            allSelected={selection.allSelected}
            onToggleRow={selection.toggleRow}
            onToggleAll={selection.toggleAll}
          />
          <Pagination
            current={meta.current_page || page}
            total={meta.last_page || 1}
            onChange={setPage}
          />
        </>
      ) : null}

      
      </>) : null}
      <SellerProductEditor
        open={editor.open}
        product={editor.entity}
        portal="admin"
        stores={storesQuery.data || []}
        categories={categoriesQuery.data || []}
        useCreateMutation={useCreateAdminProduct}
        useUpdateMutation={useUpdateAdminProduct}
        getError={getAdminProductError}
        onClose={editor.close}
        onDelete={(product) => { setDeleteTarget(product); editor.close(); }}
        onSaved={() => {
          editor.markListDirty();
          setMessage(
          editor.entity
            ? "Produk berhasil diperbarui."
            : "Produk berhasil ditambahkan.",
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Produk"
        message={`Produk “${deleteTarget?.name || ""}” akan dihapus.`}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </AdminShell>
  );
}
