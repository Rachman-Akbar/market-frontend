import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function AdminLoginPage() {
  const { loginWithPassword, logout, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    clearError();
    try {
      const session = await loginWithPassword({
        ...form,
        intended_role: "admin",
        device_name: "marketplace-web-admin",
        storage_scope: "window",
      });
      const activeRole = String(session?.activeRole || session?.active_role || session?.user?.role || "").toLowerCase();
      const roles = Array.isArray(session?.roles || session?.user?.roles) ? (session?.roles || session?.user?.roles).map((role) => String(role?.name || role || "").toLowerCase()) : [];
      if (activeRole !== "admin" && !roles.includes("admin")) {
        await logout();
        throw new Error("Akun ini tidak memiliki akses Admin.");
      }
      navigate("/admin", { replace: true });
    } catch (submitError) {
      setLocalError(submitError.message || "Login admin gagal.");
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden border border-white/10 bg-[#0b1728] shadow-2xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_36%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 border border-teal-400/30 bg-teal-400/10 px-4 py-3">
              <span className="material-symbols-outlined text-teal-300">shield_person</span>
              <span className="text-sm font-black uppercase tracking-[0.18em] text-teal-200">Admin Security Portal</span>
            </div>
            <h1 className="mt-12 max-w-xl text-5xl font-black leading-tight">Kelola platform dari ruang kerja admin yang terpisah.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">Sesi admin disimpan khusus pada jendela ini agar tidak bercampur dengan akun buyer atau seller. Semua aktivitas penting dapat dipantau melalui pusat notifikasi.</p>
          </div>
          <div className="relative z-10 mt-auto grid grid-cols-3 gap-3">
            {[['verified_user', 'Akses tervalidasi'], ['database', 'Data terpusat'], ['notifications_active', 'Antrean proses']].map(([icon, label]) => (
              <div key={label} className="border border-white/10 bg-white/5 p-4">
                <span className="material-symbols-outlined text-teal-300">{icon}</span>
                <p className="mt-3 text-sm font-bold text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 text-slate-900 sm:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke marketplace
            </Link>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-teal-700">Administrator</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Masuk ke Admin Panel</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Gunakan akun dengan role admin aktif.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Email admin</span>
                <div className="flex h-12 items-center border border-slate-200 bg-slate-50 px-3 focus-within:border-teal-500 focus-within:bg-white">
                  <span className="material-symbols-outlined mr-2 text-[19px] text-slate-400">mail</span>
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="h-full w-full bg-transparent text-sm outline-none" placeholder="admin@perusahaan.com" required />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Password</span>
                <div className="flex h-12 items-center border border-slate-200 bg-slate-50 px-3 focus-within:border-teal-500 focus-within:bg-white">
                  <span className="material-symbols-outlined mr-2 text-[19px] text-slate-400">lock</span>
                  <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="h-full w-full bg-transparent text-sm outline-none" placeholder="Masukkan password" required />
                </div>
              </label>
              {(localError || error) ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{localError || error}</div> : null}
              <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 bg-teal-600 text-sm font-black text-white hover:bg-teal-700 disabled:opacity-60">
                <span className={`material-symbols-outlined text-[19px] ${loading ? "animate-spin" : ""}`}>{loading ? "progress_activity" : "login"}</span>
                {loading ? "Memverifikasi..." : "Masuk sebagai Admin"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
