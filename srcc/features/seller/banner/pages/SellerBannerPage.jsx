import { useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerBannerCard } from "@/features/seller/banner/components/SellerBannerCard";
import { SellerBannerForm } from "@/features/seller/banner/components/SellerBannerForm";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { getSellerBannerError, useDeleteSellerBanner, useSellerBanners } from "@/features/seller/banner/services/sellerBannerService";

export default function SellerBannerPage() {
  const bannersQuery = useSellerBanners();
  const deleteMutation = useDeleteSellerBanner();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = bannersQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Banner berhasil dihapus.");
    } catch (error) {
      setMessage(getSellerBannerError(error));
    }
  };

  return (
    <SellerPanelShell title="Banner Toko" subtitle="Banner dikelola khusus untuk halaman toko buyer dan tidak digunakan sebagai hero homepage.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => bannersQuery.refetch()} refreshing={bannersQuery.isFetching} createLabel="Tambah Banner" placeholder="Cari nama banner" />
      {message ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <AsyncState loading={bannersQuery.isLoading} error={bannersQuery.error ? getSellerBannerError(bannersQuery.error) : ""} empty={!bannersQuery.isLoading && !filteredRows.length} emptyText="Banner toko belum tersedia." />
      {filteredRows.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredRows.map((banner) => <SellerBannerCard key={banner.id} banner={banner} onEdit={editor.edit} onDelete={setDeleteTarget} />)}</div> : null}
      
      </>) : null}
      <SellerBannerForm open={editor.open} entity={editor.entity} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Banner berhasil diperbarui." : "Banner berhasil ditambahkan.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Banner" message={`Banner “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </SellerPanelShell>
  );
}
