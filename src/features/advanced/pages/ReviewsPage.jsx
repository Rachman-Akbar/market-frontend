import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useDeleteReview, useReviews } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Button } from "@/shared/components/ui/Button";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

export default function ReviewsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const listQuery = useReviews({ page, per_page: 20, ...(query.trim() ? { search: query.trim() } : {}), ...(rating ? { rating } : {}) });
  const deleteMutation = useDeleteReview();
  const spreadsheet = useSpreadsheetWorkspace({ module: "review", label: "Review & Rating", allowImport: false, allowBulkDelete: false });
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const columns = useMemo(() => [
    { key: "product_name", label: "Produk" },
    { key: "order_number", label: "Order" },
    { key: "user_name", label: "Buyer" },
    { key: "rating", label: "Rating", render: (row) => `${"★".repeat(Number(row.rating || 0))}${"☆".repeat(Math.max(0, 5 - Number(row.rating || 0)))}` },
    { key: "review", label: "Review" },
    { key: "created_at", label: "Tanggal", render: (row) => row.created_at ? new Date(row.created_at).toLocaleString("id-ID") : "-" },
  ], []);

  async function remove() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Review berhasil dihapus.");
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  return (
    <>
      <ModuleFrame title="Review dan Rating Produk" subtitle="Review berasal dari Buyer setelah transaksi selesai. Seller dapat mengekspor review untuk analisis, tetapi import review dinonaktifkan agar rating tetap berasal dari transaksi nyata." query={query} onQueryChange={setQuery} onRefresh={() => listQuery.refetch()} bulkActions={spreadsheet.actions} filters={<select value={rating} onChange={(event) => { setRating(event.target.value); setPage(1); }} className="h-10 border border-slate-300 bg-white px-3 text-sm"><option value="">Semua rating</option>{[5, 4, 3, 2, 1].map((item) => <option key={item} value={item}>{item} bintang</option>)}</select>}>
        {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        <DataGrid columns={columns} rows={rows} emptyText={listQuery.isLoading ? "" : "Review belum tersedia."} actions={admin ? (row) => <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Hapus</Button> : undefined} />
        {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
      </ModuleFrame>
      <SpreadsheetOperationPanel workspace={spreadsheet} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Review" message={`Review untuk produk “${deleteTarget?.product_name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </>
  );
}
