import { Link } from "react-router-dom";
import { Store, Package, BarChart3, Settings, MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

const MODULES = [
  { icon: Package, label: "Produk Saya", desc: "Kelola daftar produk & stok", href: "#" },
  { icon: BarChart3, label: "Laporan", desc: "Lihat penjualan & analitik", href: "#" },
  { icon: MessageCircle, label: "Chat Pembeli", desc: "Pesan masuk dari pembeli", href: "#" },
  { icon: Settings, label: "Pengaturan Toko", desc: "Edit profil & informasi toko", href: "#" },
];

export default function SellerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Store size={28} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Penjual</h1>
            <p className="text-gray-500 text-sm">Toko Demo Store</p>
          </div>
        </div>
        <Link to="/"><Button variant="outline">← Ke Marketplace</Button></Link>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 text-center">
        <p className="text-4xl mb-3">🚧</p>
        <h2 className="text-xl font-bold text-orange-700">Seller Dashboard — Coming Soon</h2>
        <p className="text-orange-600 mt-2 text-sm">Fitur seller dashboard sedang dalam pengembangan. Saat ini Anda melihat tampilan placeholder.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MODULES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center gap-2 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Icon size={24} className="text-orange-500" />
            </div>
            <p className="font-semibold text-gray-800 text-sm">{label}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
