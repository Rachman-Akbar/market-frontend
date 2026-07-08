import { useEffect, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { SellerProductToolbar } from "@/features/seller/product/components/SellerProductToolbar";
import { SellerProductTable } from "@/features/seller/product/components/SellerProductTable";
import { SellerProductEditor } from "@/features/seller/product/components/SellerProductEditor";
import { getSellerProductRows } from "@/features/seller/product/services/sellerProductService";

export default function SellerProductsPage() {
  const [rows, setRows] = useState([]);
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "sku", "category"]);

  useEffect(() => {
    getSellerProductRows().then(setRows);
  }, []);

  return (
    <SellerPanelShell title="Produk Toko" subtitle="Kelola produk, SKU, harga, stok, status review, dan performa penjualan.">
      <SellerProductToolbar query={query} onQueryChange={setQuery} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SellerProductTable rows={filteredRows} />
        <SellerProductEditor />
      </div>
    </SellerPanelShell>
  );
}
