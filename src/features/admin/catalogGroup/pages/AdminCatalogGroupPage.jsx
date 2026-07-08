import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { CatalogGroupBoard } from "@/features/admin/catalogGroup/components/CatalogGroupBoard";
import { CatalogGroupTable } from "@/features/admin/catalogGroup/components/CatalogGroupTable";
import { getCatalogGroupAdminRows } from "@/features/admin/catalogGroup/services/catalogGroupAdminService";

export default function AdminCatalogGroupPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getCatalogGroupAdminRows().then(setRows);
  }, []);

  return (
    <AdminShell
      title="Catalog Group"
      subtitle="Group katalog menjadi level atas navigasi marketplace. Struktur mengikuti domain catalogGroup sebagai referensi utama."
      actions={<Button className="bg-teal-600 hover:bg-teal-700">Tambah Group</Button>}
    >
      <CatalogGroupBoard rows={rows} />
      <CatalogGroupTable rows={rows} />
    </AdminShell>
  );
}
