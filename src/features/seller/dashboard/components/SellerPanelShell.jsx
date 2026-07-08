import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: "dashboard" },
  { href: "/seller/products", label: "Produk", icon: "inventory_2" },
  { href: "/seller/banners", label: "Banner", icon: "view_carousel" },
  { href: "/seller/store", label: "Toko", icon: "storefront" },
  { href: "/seller/orders", label: "Pesanan", icon: "receipt_long" },
];

export function SellerPanelShell({ title, subtitle, actions, children }) {
  return (
    <section className="min-w-0">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Seller Panel</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}