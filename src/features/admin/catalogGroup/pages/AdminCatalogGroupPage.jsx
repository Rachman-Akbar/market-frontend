import { Button } from "@/shared/components/ui/Button";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { CatalogGroupBoard } from "@/features/admin/catalogGroup/components/CatalogGroupBoard";
import { CatalogGroupTable } from "@/features/admin/catalogGroup/components/CatalogGroupTable";
import { useAdminCatalogGroups } from "@/features/admin/adminService";

export default function AdminCatalogGroupPage() {
  const groupsQuery = useAdminCatalogGroups();
  const rows = groupsQuery.data || [];

  return (
    <AdminShell
      title="Catalog Group"
      subtitle="Group katalog menjadi level atas navigasi marketplace. Struktur mengikuti domain catalogGroup sebagai referensi utama."
      actions={<Button className="bg-teal-600 hover:bg-teal-700">Tambah Group</Button>}
    >
      {groupsQuery.isLoading ? <p className="py-8 text-sm text-slate-500">Memuat catalog group...</p> : null}
      {groupsQuery.error ? <p className="py-8 text-sm text-red-600">{groupsQuery.error.message}</p> : null}
      <CatalogGroupBoard rows={rows} />
      <CatalogGroupTable rows={rows} />
    </AdminShell>
  );
}
