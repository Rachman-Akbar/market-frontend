import { useDeferredValue, useEffect, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import {
  getSellerProductError,
  useDeleteSellerProduct,
  useSellerProducts,
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
  const rows = productsQuery.data?.rows || [];
  const meta = productsQuery.data?.meta || {};

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, status]);

  const remove = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
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
        filters={(
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none"
          >
            <option value="">Semua status</option>
            <option value="active">Active</option>
            <option value="inactive">Non-Active</option>
          </select>
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
        message={`Produk “${deleteTarget?.name || ""}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </SellerPanelShell>
  );
}
