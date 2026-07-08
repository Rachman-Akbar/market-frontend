import { useAuth } from "@/features/auth/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.slice(0, 1)?.toUpperCase() || "G";

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f6ef] text-2xl font-extrabold text-[#075e54]">
          G
        </div>
        <p className="mb-4 text-sm text-slate-500">Silakan masuk untuk melihat profil.</p>
        <Link to="/auth/login"><Button className="bg-[#128c7e] hover:bg-[#075e54]">Masuk</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#075e54] px-6 py-8 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-extrabold ring-4 ring-white/20">
              {initial}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">{user.name}</h2>
              <p className="mt-1 text-sm text-white/75">{user.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold capitalize text-white ring-1 ring-white/20">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Nama lengkap</span>
            <Input defaultValue={user.name} readOnly className="rounded-2xl border-slate-200 bg-slate-50 focus:ring-[#128c7e]" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Email</span>
            <Input defaultValue={user.email} readOnly className="rounded-2xl border-slate-200 bg-slate-50 focus:ring-[#128c7e]" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Nomor telepon</span>
            <Input defaultValue="0812-3456-7890" readOnly className="rounded-2xl border-slate-200 bg-slate-50 focus:ring-[#128c7e]" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Status akun</span>
            <Input defaultValue="Terverifikasi" readOnly className="rounded-2xl border-slate-200 bg-slate-50 focus:ring-[#128c7e]" />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900">Privasi dan keamanan</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: "Login terakhir", value: "Hari ini, 08:05" },
            { label: "Verifikasi", value: "Email aktif" },
            { label: "Notifikasi", value: "Aktif" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => { logout(); navigate("/"); }}
          className="mt-5 border-red-200 text-red-600 hover:bg-red-50"
        >
          Keluar
        </Button>
      </div>
    </div>
  );
}
