import { Link } from "react-router-dom";
import { Shield, Users, Package, Tag, Image, BarChart3, Settings } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

const MODULES = [
  { icon: Users, label: "Manajemen User", desc: "Kelola pembeli & penjual" },
  { icon: Package, label: "Produk & Kategori", desc: "Moderasi produk & katalog" },
  { icon: Tag, label: "Voucher", desc: "Buat & kelola promo" },
  { icon: Image, label: "Banner", desc: "Atur banner homepage" },
  { icon: BarChart3, label: "Analitik", desc: "Laporan platform" },
  { icon: Settings, label: "Pengaturan", desc: "Konfigurasi sistem" },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Shield size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500 text-sm">MarketKu Administration</p>
          </div>
        </div>
        <Link to="/"><Button variant="outline">← Ke Marketplace</Button></Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
        <p className="text-4xl mb-3">🔐</p>
        <h2 className="text-xl font-bold text-red-700">Admin Panel — Coming Soon</h2>
        <p className="text-red-600 mt-2 text-sm">Panel administrasi sedang dalam pengembangan. Anda masuk sebagai Admin.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MODULES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-100 transition">
              <Icon size={24} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
