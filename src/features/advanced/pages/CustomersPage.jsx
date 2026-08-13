import { useDeferredValue, useMemo, useState } from "react";
import { useCustomers } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Pagination } from "@/shared/components/ui/Pagination";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query.trim());
  const listQuery = useCustomers({ page, per_page: 20, ...(deferredQuery ? { search: deferredQuery } : {}) });
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const columns = useMemo(() => [
    { key: "name", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "orders_count", label: "Jumlah Pesanan" },
    { key: "total_spent", label: "Total Belanja", render: (row) => money(row.total_spent) },
    { key: "last_order_at", label: "Pesanan Terakhir", render: (row) => row.last_order_at ? new Date(row.last_order_at).toLocaleString("id-ID") : "-" },
    { key: "is_active", label: "Status", render: (row) => row.is_active ? "Aktif" : "Nonaktif" },
  ], []);

  return (
    <ModuleFrame title="Pelanggan" subtitle="Daftar otomatis dibentuk dari buyer yang pernah bertransaksi pada toko seller." query={query} onQueryChange={setQuery} onRefresh={() => listQuery.refetch()}>
      <DataGrid columns={columns} rows={rows} emptyText={listQuery.isLoading ? "Memuat pelanggan..." : "Belum ada pelanggan yang pernah membeli."} />
      {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
    </ModuleFrame>
  );
}
