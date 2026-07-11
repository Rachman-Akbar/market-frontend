import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const PORTALS = {
  buyer: {
    role: "buyer",
    redirect: "/",
    eyebrow: "Masuk akun",
    title: "Selamat datang kembali",
    description: "Masuk untuk melanjutkan belanja, mengelola pesanan, dan menggunakan seluruh fitur akun.",
    submitLabel: "Masuk",
    deviceName: "marketplace-web-buyer",
    showRegister: true,
    storageScope: "base",
  },
  admin: {
    role: "admin",
    redirect: "/admin",
    eyebrow: "Masuk akun",
    title: "Selamat datang kembali",
    description: "Masuk menggunakan akun yang memiliki akses admin.",
    submitLabel: "Masuk",
    deviceName: "marketplace-web-admin",
    showRegister: false,
    storageScope: "window",
  },
  chat: {
    role: "buyer",
    redirect: "/chat",
    eyebrow: "Chat portal",
    title: "Masuk ke Chat",
    description: "Masuk melalui halaman khusus agar sesi chat tidak bercampur dengan portal lain.",
    submitLabel: "Masuk ke Chat",
    deviceName: "marketplace-web-chat",
    showRegister: false,
    storageScope: "window",
  },
};

export default function LoginPage({ portal = "buyer" }) {
  const config = useMemo(() => PORTALS[portal] || PORTALS.buyer, [portal]);
  const { loginWithPassword, loginWithGoogle, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const message = localError || error;

  const getRedirectPath = () => {
    const query = new URLSearchParams(location.search);
    const redirect = query.get("redirect");
    const statePath = location.state?.from?.pathname;
    return redirect || statePath || config.redirect;
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
      await loginWithPassword({
        ...form,
        role: config.role,
        deviceName: config.deviceName,
        storageScope: config.storageScope,
      });
      navigate(getRedirectPath(), { replace: true });
    } catch (submitError) {
      setLocalError(submitError.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError("");
    clearError();

    try {
      await loginWithGoogle({
        role: config.role,
        deviceName: config.deviceName,
        storageScope: config.storageScope,
      });
      navigate(getRedirectPath(), { replace: true });
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#03ac0e]">{config.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{config.description}</p>
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
          {loading ? "Memproses..." : config.submitLabel}
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

      {config.showRegister ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link to="/auth/register" className="font-black text-[#03ac0e] hover:underline">
            Daftar sekarang
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/auth/login" className="font-black text-[#03ac0e] hover:underline">
            Kembali ke login pengguna
          </Link>
        </p>
      )}
    </div>
  );
}
