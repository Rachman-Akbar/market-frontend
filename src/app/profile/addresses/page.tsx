import { mockAddresses } from "@/lib/mockData";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AddressesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800 text-lg">Alamat Saya</h2>
        <Button size="sm" variant="outline" className="flex items-center gap-1.5">
          <Plus size={14} /> Tambah Alamat
        </Button>
      </div>
      <div className="space-y-3">
        {mockAddresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-500" />
                <span className="font-semibold text-sm text-gray-800">{addr.label}</span>
                {addr.isDefault && <Badge variant="default" className="text-xs">Utama</Badge>}
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-orange-500">Edit</Button>
            </div>
            <p className="text-sm text-gray-700 font-medium">{addr.recipientName}</p>
            <p className="text-sm text-gray-500">{addr.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
