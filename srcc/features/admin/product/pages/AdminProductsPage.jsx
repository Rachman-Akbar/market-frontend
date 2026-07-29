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
import { SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { ConfirmDialog, EntityToolbar } from "@/shared/components/crud";
import { AsyncState } from "@/shared/components/feedback";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useEntityEditor } from "@/shared/hooks";

const PER_PAGE = 20;

export default function AdminProductsPage() {
  const [status, setStatus] = useState("");
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
    ...(status ? { is_active: status === "active" } : {}),
  });
  const storesQuery = useAdminProductStores();
  const categoriesQuery = useAdminCategoryList();
  const deleteMutation = useDeleteAdminProduct();
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

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, status]);

  const remove = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
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
        filters={(
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600"
          >
            <option value="">Semua status</option>
            <option value="active">Active</option>
            <option value="inactive">Non-Active</option>
          </select>
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
            onDelete={setDeleteTarget}
            deletingId={deleteMutation.variables}
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
        onSaved={() => setMessage(
          editor.entity
            ? "Produk berhasil diperbarui."
            : "Produk berhasil ditambahkan.",
        )}
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
