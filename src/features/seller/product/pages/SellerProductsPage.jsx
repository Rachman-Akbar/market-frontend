import { useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { SellerProductToolbar } from "@/features/seller/product/components/SellerProductToolbar";
import { SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import {
  getSellerProductError,
  useDeleteSellerProduct,
  useSellerProducts,
} from "@/features/seller/product/services/sellerProductService";

export default function SellerProductsPage() {
  const productsQuery = useSellerProducts({ per_page: 100 });
  const deleteMutation = useDeleteSellerProduct();
  const rows = productsQuery.data?.rows || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, [
    "name",
    "sku",
    "category",
  ]);
  const [editorState, setEditorState] = useState(null);
  const [message, setMessage] = useState("");
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

  const removeProduct = async (product) => {
    const confirmed = window.confirm(`Hapus produk "${product.name}"?`);
    if (!confirmed) return;

    try {
      setMessage("");
      await deleteMutation.mutateAsync(product.id);
      if (editorState?.product?.id === product.id) setEditorState(null);
      setMessage("Produk berhasil dihapus.");
    } catch (error) {
      setMessage(getSellerProductError(error));
    }
  };

  return (
    <SellerPanelShell
      title="Produk Toko"
      subtitle="Kelola produk seller langsung dari database Laravel, termasuk gambar, kategori, harga, stok, dan status."
    >
      <SellerProductToolbar
        query={query}
        onQueryChange={setQuery}
        onCreate={() => setEditorState({ mode: "create", product: null })}
        refreshing={productsQuery.isFetching}
        onRefresh={() => productsQuery.refetch()}
      />

      {productsQuery.isLoading ? (
        <p className="mb-4 text-sm text-slate-500">Memuat produk...</p>
      ) : null}
      {productsQuery.error ? (
        <p className="mb-4 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600">
          {getSellerProductError(productsQuery.error)}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-[#047857]">
          {message}
        </p>
      ) : null}

      <div
        className={`grid gap-6 ${editorState ? "xl:grid-cols-[minmax(0,1fr)_430px]" : "grid-cols-1"}`}
      >
        <SellerProductTable
          rows={filteredRows}
          onEdit={(product) => setEditorState({ mode: "edit", product })}
          onDelete={removeProduct}
          deletingId={deletingId}
        />

        {editorState ? (
          <SellerProductEditor
            key={`${editorState.mode}-${editorState.product?.id || "new"}`}
            mode={editorState.mode}
            product={editorState.product}
            onClose={() => setEditorState(null)}
            onSaved={() => {
              setEditorState(null);
              setMessage(
                editorState.mode === "edit"
                  ? "Produk berhasil diperbarui."
                  : "Produk berhasil ditambahkan.",
              );
            }}
          />
        ) : null}
      </div>
    </SellerPanelShell>
  );
}
