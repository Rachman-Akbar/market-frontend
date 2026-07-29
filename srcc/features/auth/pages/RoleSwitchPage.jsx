import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function RoleSwitchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const started = useRef(false);
  const [message, setMessage] = useState("Menyiapkan sesi Seller...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const query = new URLSearchParams(location.search);
    const redirect = query.get("redirect") || "/seller";

    switchRole("seller", {
      deviceName: "marketplace-web-seller",
      storageScope: "window",
    })
      .then(() => navigate(redirect, { replace: true }))
      .catch(() => {
        setMessage(
          "Akun belum memiliki toko. Membuka halaman pendaftaran toko...",
        );
        navigate("/auth/seller/onboarding", { replace: true });
      });
  }, [location.search, navigate, switchRole]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#10B981]" />
        <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p>
      </div>
    </div>
  );
}
