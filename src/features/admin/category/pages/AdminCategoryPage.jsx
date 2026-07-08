import { useEffect, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { CategoryAdminToolbar } from "@/features/admin/category/components/CategoryAdminToolbar";
import { CategoryAdminTable } from "@/features/admin/category/components/CategoryAdminTable";
import { CategoryAdminForm } from "@/features/admin/category/components/CategoryAdminForm";
import { getCategoryAdminRows } from "@/features/admin/category/services/categoryAdminService";

export default function AdminCategoryPage() {
  const [rows, setRows] = useState([]);
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "group", "slug", "parent"]);

  useEffect(() => {
    getCategoryAdminRows().then(setRows);
  }, []);

  return (
    <AdminShell title="Manajemen Kategori" subtitle="Kelola struktur kategori marketplace, parent-child, visibilitas menu, dan readiness data katalog.">
      <CategoryAdminToolbar query={query} onQueryChange={setQuery} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <CategoryAdminTable rows={filteredRows} />
        <CategoryAdminForm />
      </div>
    </AdminShell>
  );
}
