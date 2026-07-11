import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { SellerProductToolbar } from "@/features/seller/product/components/SellerProductToolbar";
import { SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { useSellerProducts } from "@/features/seller/product/services/sellerProductService";

export default function SellerProductsPage() {
  const productsQuery = useSellerProducts({ per_page: 24 });
  const rows = productsQuery.data?.rows || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "sku", "category"]);

  return (
    <SellerPanelShell title="Produk Toko" subtitle="Kelola produk, SKU, harga, stok, status review, dan performa penjualan.">
      <SellerProductToolbar query={query} onQueryChange={setQuery} />
      {productsQuery.isLoading ? <p className="mb-4 text-sm text-slate-500">Memuat produk...</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SellerProductTable rows={filteredRows} />
        <SellerProductEditor />
      </div>
    </SellerPanelShell>
  );
}
