import { mockAddresses } from "@/shared/data/mockData";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";

export default function AddressesPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Alamat Saya</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola alamat pengiriman untuk checkout lebih cepat.</p>
        </div>
        <Button size="sm" variant="outline" className="flex items-center gap-1.5 rounded-2xl border-[#128c7e] text-[#075e54] hover:bg-[#e7f6ef]">
          <Plus size={14} /> Tambah Alamat
        </Button>
      </div>
      <div className="space-y-3">
        {mockAddresses.map((addr) => (
          <div key={addr.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#128c7e]" />
                <span className="text-sm font-extrabold text-slate-800">{addr.label}</span>
                {addr.isDefault && <Badge variant="success" className="text-xs">Utama</Badge>}
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-[#075e54] hover:bg-[#e7f6ef]">Edit</Button>
            </div>
            <p className="text-sm font-semibold text-slate-700">{addr.recipientName}</p>
            <p className="text-sm text-slate-500">{addr.phone}</p>
            <p className="mt-1 text-sm text-slate-600">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
