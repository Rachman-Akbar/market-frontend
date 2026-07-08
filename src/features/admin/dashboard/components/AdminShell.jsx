import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/catalog-groups", label: "Catalog Group", icon: "category" },
  { href: "/admin/categories", label: "Kategori", icon: "account_tree" },
  { href: "/admin/moderation", label: "Moderasi", icon: "verified" },
  { href: "/admin/reports", label: "Laporan", icon: "bar_chart" },
];

export function AdminShell({ title, subtitle, children, actions }) {
  return (
    <section className="min-w-0">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Admin Panel</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children}
    </section>
  );
}
