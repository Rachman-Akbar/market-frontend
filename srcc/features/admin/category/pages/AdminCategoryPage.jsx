import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { CategoryCrudTable } from "@/features/admin/category/components/CategoryCrudTable";
import { CategoryFormDialog } from "@/features/admin/category/components/CategoryFormDialog";
import { useAdminCatalogGroups } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";
import { getCategoryError, useAdminCategoryList, useDeleteAdminCategory } from "@/features/admin/category/services/adminCategoryService";

export default function AdminCategoryPage() {
  const categoriesQuery = useAdminCategoryList();
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCategory();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = categoriesQuery.data || [];
  const groupsById = useMemo(() => Object.fromEntries((groupsQuery.data || []).map((group) => [group.id, group.name])), [groupsQuery.data]);
  const searchableRows = useMemo(() => rows.map((row) => ({ ...row, groupName: groupsById[row.catalogGroupId] || "" })), [groupsById, rows]);
  const { query, setQuery, filteredRows } = useTableSearch(searchableRows, ["name", "slug", "fullSlug", "parentName", "groupName"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Kategori berhasil dihapus.");
    } catch (error) {
      setMessage(getCategoryError(error));
    }
  };

  return (
    <AdminShell title="Manajemen Kategori" subtitle="Kelola struktur kategori parent-child, urutan, visibilitas menu, dan status active/non-active.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => categoriesQuery.refetch()} refreshing={categoriesQuery.isFetching} createLabel="Tambah Kategori" placeholder="Cari kategori, parent, atau group" />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={categoriesQuery.isLoading} error={categoriesQuery.error ? getCategoryError(categoriesQuery.error) : ""} empty={!categoriesQuery.isLoading && !filteredRows.length} emptyText="Kategori belum tersedia." />
      {filteredRows.length ? <CategoryCrudTable rows={filteredRows} groupsById={groupsById} onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      
      </>) : null}
      <CategoryFormDialog open={editor.open} entity={editor.entity} categories={rows} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Kategori" message={`Kategori “${deleteTarget?.name || ""}” akan dihapus. Pastikan tidak ada child atau produk yang masih bergantung.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
