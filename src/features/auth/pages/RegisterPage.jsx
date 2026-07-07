import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return setError("Nama wajib diisi");
    if (form.password.length < 6) return setError("Password minimal 6 karakter");
    if (form.password !== form.confirm) return setError("Konfirmasi password tidak cocok");
    login("buyer", form.name);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">MarketKu</h1>
          <p className="text-gray-600 text-sm mt-1">Buat akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
            <Input name="name" placeholder="Nama Anda" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <Input name="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <Input name="password" type="password" placeholder="Min. 6 karakter" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Konfirmasi Password</label>
            <Input name="confirm" type="password" placeholder="Ulangi password" value={form.confirm} onChange={handleChange} required />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" className="w-full" size="lg">Daftar Sekarang</Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">atau</span></div>
          </div>

          <Button type="button" variant="outline" className="w-full">
            <span className="mr-2">🔵</span> Daftar dengan Google (Demo)
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <Link to="/auth/login" className="text-orange-500 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
