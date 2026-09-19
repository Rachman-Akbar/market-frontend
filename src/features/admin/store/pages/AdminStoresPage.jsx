import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { AdminStoreEditor } from "@/features/admin/store/components/AdminStoreEditor";
import { StoreModerationDialog } from "@/features/admin/store/components/StoreModerationDialog";
import { ADMIN_STORE_COLUMNS, AdminStoreTable } from "@/features/admin/store/components/AdminStoreTable";
import { getAdminStoreError, useAdminStores, useUpdateAdminStoreStatus } from "@/features/admin/store/services/adminStoreService";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { InfiniteScrollSentinel } from "@/shared/components/ui/InfiniteScrollSentinel";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

const PER_PAGE = 20;

export default function AdminStoresPage() {
  const [draftQuery, setDraftQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [moderation, setModeration] = useState({ open: false, action: "", stores: [] });
  const editor = useEntityEditor();
  const storesQuery = useAdminStores({ per_page: PER_PAGE, ...(search ? { search } : {}), ...(status ? { status } : {}) });
  const statusMutation = useUpdateAdminStoreStatus();
  const rows = storesQuery.data?.rows || [];
  const columns = useMemo(() => mergeColumns(ADMIN_STORE_COLUMNS, buildRawColumns(rows, ["id", "user_id", "name", "slug", "description", "short_description", "phone", "email", "city", "province", "address", "status", "is_active", "logo", "banner_url", "created_at", "updated_at"])), [rows]);
  const selection = useTableSelection(rows);
  const columnVisibility = useColumnVisibility(columns, "admin-stores");

  const submitSearch = () => {
    setSearch(draftQuery.trim());
  };

  const bulkStatus = async (nextStatus, chatMessage = null) => {
    if (!selection.selectedRows.length) return;
    try {
      for (const store of selection.selectedRows) {
        await statusMutation.mutateAsync({
          id: store.id,
          status: nextStatus,
          isActive: nextStatus === "suspended" ? false : store.isActive,
          message: chatMessage,
        });
      }
      selection.clear();
      setMessage(`Status toko terpilih diubah menjadi ${nextStatus}.`);
    } catch (error) {
      setMessage(getAdminStoreError(error));
    } finally {
      setModeration({ open: false, action: "", stores: [] });
    }
  };

  return (
    <AdminShell>
      {editor.isListActive ? (
        <>
          <EntityToolbar
            query={draftQuery}
            onQueryChange={setDraftQuery}
            onSearch={submitSearch}
            onCreate={undefined}
            hideCreate
            onRefresh={() => storesQuery.refetch()}
            refreshing={storesQuery.isFetching}
            placeholder="Cari toko lalu tekan Enter"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={[
              { key: "approved", label: "Approve toko terpilih", icon: "verified", onClick: () => setModeration({ open: true, action: "approved", stores: selection.selectedRows.map((s) => ({ id: s.id, name: s.name, ownerName: s.ownerName })) }) },
              { key: "pending", label: "Kembalikan ke Pending", icon: "schedule", onClick: () => bulkStatus("pending") },
              { key: "suspended", label: "Suspend toko terpilih", icon: "block", danger: true, onClick: () => setModeration({ open: true, action: "suspended", stores: selection.selectedRows.map((s) => ({ id: s.id, name: s.name, ownerName: s.ownerName })) }) },
            ]}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            onApplyDefaultColumns={columnVisibility.applyAsDefault}
            filters={<SearchableSelect value={status} onChange={(nextValue) => setStatus(nextValue)} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "suspended", label: "Suspended" }]} placeholder="Semua status" className="w-44" buttonClassName="h-10" />}
          />
          {message ? <p className="mb-3 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
          <AsyncState loading={storesQuery.isLoading} error={storesQuery.error ? getAdminStoreError(storesQuery.error) : ""} empty={!storesQuery.isLoading && !rows.length} emptyText="Toko belum tersedia." />
          {rows.length ? <AdminStoreTable rows={rows} columns={columns} onEdit={editor.edit} pendingId={statusMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} onToggleActive={(store, isActive) => {
            statusMutation.mutate(
              { id: store.id, status: store.status, isActive },
              {
                onSuccess: () => setMessage("Status operasional toko berhasil diperbarui."),
                onError: (error) => setMessage(getAdminStoreError(error)),
              },
            );
          }} /> : null}
          <InfiniteScrollSentinel hasNextPage={storesQuery.hasNextPage} isFetchingNextPage={storesQuery.isFetchingNextPage} onLoadMore={() => storesQuery.fetchNextPage()} />
        </>
      ) : null}
      <StoreModerationDialog
        open={moderation.open}
        action={moderation.action}
        stores={moderation.stores}
        pending={statusMutation.isPending}
        onConfirm={(chatMessage) => bulkStatus(moderation.action, chatMessage)}
        onClose={() => setModeration({ open: false, action: "", stores: [] })}
      />
      <AdminStoreEditor open={editor.open} store={editor.entity} onClose={editor.close} onSaved={() => setMessage("Toko berhasil diperbarui.")} />
    </AdminShell>
  );
}
