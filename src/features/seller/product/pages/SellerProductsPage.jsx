import { useDeferredValue, useEffect, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { PRODUCT_TABLE_COLUMNS, SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import {
  getSellerProductError,
  useDeleteSellerProduct,
  useSellerProducts,
  useUpdateSellerProduct,
} from "@/features/seller/product/services/sellerProductService";

const PER_PAGE = 20;

export default function SellerProductsPage() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor();
  const productsQuery = useSellerProducts({
    page,
    per_page: PER_PAGE,
    ...(deferredQuery ? { search: deferredQuery } : {}),
    ...(status ? { is_active: status === "active" } : {}),
  });
  const deleteMutation = useDeleteSellerProduct();
  const quickUpdateMutation = useUpdateSellerProduct();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: productsQuery.refetch });
  const rows = productsQuery.data?.rows || [];
  const meta = productsQuery.data?.meta || {};
  const columns = mergeColumns(PRODUCT_TABLE_COLUMNS.filter((column) => column.key !== "store" && column.key !== "status"), buildRawColumns(rows, ["id", "store_id", "name", "thumbnail", "variants", "images", "price", "stock", "status", "is_active"]));
  const columnVisibility = useColumnVisibility(columns, "seller-products");
  const selection = useTableSelection(rows);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, status]);

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const product of selection.selectedRows) await deleteMutation.mutateAsync(product.id);
      selection.clear();
      setMessage("Produk terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getSellerProductError(error));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setMessage("Produk berhasil dihapus.");
      setDeleteTarget(null);
    } catch (error) {
      setMessage(getSellerProductError(error));
    }
  };

  return (
    <SellerPanelShell
      title="Produk Toko"
      subtitle="Kelola produk tanpa variant maupun dengan variant, gambar utama, galeri, harga, stok, dan status."
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
          <SearchableSelect
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Non-Active" },
            ]}
            placeholder="Semua status"
            className="w-40"
            buttonClassName="h-10"
          />
        )}
      />

      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}

      <AsyncState
        loading={productsQuery.isLoading}
        error={productsQuery.error ? getSellerProductError(productsQuery.error) : ""}
        empty={!productsQuery.isLoading && !rows.length}
        emptyText="Produk belum tersedia."
      />

      {rows.length ? (
        <>
          <SellerProductTable
            rows={rows}
            onEdit={editor.edit}
            onToggleActive={(product, isActive) => quickUpdateMutation.mutate({ id: product.id, values: { ...product, isActive } })}
            pendingId={quickUpdateMutation.variables?.id}
            portal="seller"
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
        message={`Produk “${deleteTarget?.name || ""}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </SellerPanelShell>
  );
}
