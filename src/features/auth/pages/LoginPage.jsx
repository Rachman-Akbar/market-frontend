import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { cn } from "@/shared/utils/utils";

const ROLES = [
  {
    value: "buyer",
    label: "Pembeli",
    desc: "Belanja dan kelola pesanan",
    redirect: "/",
  },
  {
    value: "seller",
    label: "Penjual",
    desc: "Kelola toko dan produk",
    redirect: "/seller",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Panel administrasi",
    redirect: "/admin",
  },
];

export default function LoginPage() {
  const { loginWithPassword, loginWithGoogle, switchRole, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const selectedRole = useMemo(() => ROLES.find((item) => item.value === role) ?? ROLES[0], [role]);
  const message = localError || error;

  const redirectAfterLogin = async () => {
    const fallback = location.state?.from?.pathname || selectedRole.redirect;

    if (role !== "buyer") {
      try {
        await switchRole(role);
      } catch {
        navigate(fallback === selectedRole.redirect ? "/" : fallback, { replace: true });
        return;
      }
    }

    navigate(fallback, { replace: true });
  };

  const handleChange = (event) => {
    setLocalError("");
    clearError();
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setLocalError("Email wajib diisi");
      return;
    }

    if (!form.password) {
      setLocalError("Password wajib diisi");
      return;
    }

    try {
      await loginWithPassword(form);
      await redirectAfterLogin();
    } catch (submitError) {
      setLocalError(submitError.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError("");
    clearError();

    try {
      await loginWithGoogle();
      await redirectAfterLogin();
    } catch (submitError) {
      setLocalError(submitError.message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link to="/" className="hidden items-center gap-2 lg:inline-flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#03ac0e] text-lg font-black text-white">
            M
          </span>
          <span className="text-xl font-black text-[#03ac0e]">MarketKu</span>
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#03ac0e]">Masuk akun</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Selamat datang kembali</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masuk untuk melanjutkan belanja, mengelola toko, atau membuka panel admin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="email@contoh.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <Link to="/auth/forgot-password" className="text-xs font-black text-[#03ac0e] hover:underline">
              Lupa password?
            </Link>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:bg-white focus:ring-[#03ac0e]"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-700">Masuk sebagai</label>
            <span className="text-xs font-semibold text-slate-400">Role akun</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {ROLES.map((item) => {
              const active = role === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition",
                    active
                      ? "border-[#03ac0e] bg-[#ecfff4] shadow-[0_12px_28px_rgba(3,172,14,0.12)]"
                      : "border-slate-200 bg-white hover:border-[#03ac0e]/40 hover:bg-slate-50"
                  )}
                >
                  <p className={cn("text-sm font-black", active ? "text-[#03ac0e]" : "text-slate-800")}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-[#03ac0e] font-black shadow-[0_14px_30px_rgba(3,172,14,0.24)] hover:bg-[#039f0d] focus-visible:ring-[#03ac0e] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Memproses..." : `Masuk sebagai ${selectedRole.label}`}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-3 font-semibold">atau masuk dengan</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="h-12 w-full rounded-xl border-slate-200 font-bold text-slate-700 hover:border-[#03ac0e]/40 hover:bg-[#f4fff8] hover:text-[#03ac0e] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Google
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-black text-[#03ac0e] hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
