"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/store/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; desc: string; redirect: string }[] = [
  { value: "buyer", label: "👤 Pembeli", desc: "Belanja & kelola pesanan", redirect: "/" },
  { value: "seller", label: "🏪 Penjual", desc: "Kelola toko & produk", redirect: "/seller" },
  { value: "admin", label: "⚙️ Admin", desc: "Panel administrasi", redirect: "/admin" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("buyer");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, name || undefined);
    const redirect = ROLES.find((r) => r.value === role)?.redirect ?? "/";
    router.push(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">MarketKu</h1>
          <p className="text-gray-600 text-sm mt-1">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama (opsional)</label>
            <Input placeholder="Nama tampilan Anda" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <Input type="email" defaultValue="demo@marketku.com" readOnly className="bg-gray-50 text-gray-400" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <Input type="password" defaultValue="demo1234" readOnly className="bg-gray-50 text-gray-400" />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Masuk sebagai</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 border-2 rounded-xl text-center transition-all ${
                    role === r.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <p className="text-lg">{r.label.split(" ")[0]}</p>
                  <p className="text-xs font-medium text-gray-700 mt-1">{r.label.split(" ").slice(1).join(" ")}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Masuk sebagai {ROLES.find((r) => r.value === role)?.label.split(" ").slice(1).join(" ")}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">atau</span></div>
          </div>

          <Button type="button" variant="outline" className="w-full">
            <span className="mr-2">🔵</span> Masuk dengan Google (Demo)
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-orange-500 font-medium hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
