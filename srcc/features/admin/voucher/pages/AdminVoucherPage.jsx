import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { VoucherManagementPage } from "@/features/order/voucher/components/VoucherManagementPage";

export default function AdminVoucherPage() {
  return <VoucherManagementPage portal="admin">{(content) => <AdminShell title="Manajemen Voucher" subtitle="Kelola voucher platform maupun voucher toko beserta status active/non-active.">{content}</AdminShell>}</VoucherManagementPage>;
}
