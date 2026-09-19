import { useDeferredValue, useMemo, useState } from "react";
import { useCustomers } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const listQuery = useCustomers({ per_page: 20, ...(deferredQuery ? { search: deferredQuery } : {}) });
  const rows = listQuery.data?.rows || [];
  const spreadsheet = useSpreadsheetWorkspace({ module: "customer", label: "Pelanggan", allowImport: false, allowBulkDelete: false });
  const columns = useMemo(() => [
    { key: "name", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "orders_count", label: "Jumlah Pesanan" },
    { key: "total_spent", label: "Total Belanja", render: (row) => money(row.total_spent) },
    { key: "last_order_at", label: "Pesanan Terakhir", render: (row) => row.last_order_at ? new Date(row.last_order_at).toLocaleString("id-ID") : "-" },
    { key: "is_active", label: "Status", render: (row) => row.is_active ? "Aktif" : "Nonaktif" },
  ], []);

  return <>
    <ModuleFrame
      title="Pelanggan"
      subtitle="Daftar dibentuk dari transaksi buyer yang benar-benar terjadi pada toko. Pelanggan dapat diexport, tetapi tidak diimport agar tidak membuat relasi transaksi palsu."
      query={query}
      onQueryChange={setQuery}
      onRefresh={() => listQuery.refetch()}
      bulkActions={spreadsheet.actions}
    >
      <DataGrid
        storageKey="seller.customers"
        columns={columns}
        rows={rows}
        emptyText={listQuery.isLoading ? "" : "Belum ada pelanggan yang pernah membeli."}
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        onLoadMore={() => listQuery.fetchNextPage()}
      />
    </ModuleFrame>
    <SpreadsheetOperationPanel workspace={spreadsheet} />
  </>;
}
