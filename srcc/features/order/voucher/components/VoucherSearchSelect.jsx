import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Ticket, X } from "lucide-react";
import { useActiveVouchers } from "@/features/order/voucher/services/voucherService";
import { formatPrice } from "@/shared/utils/utils";

function getVoucherSummary(voucher) {
  const discount =
    voucher.discountType === "percentage"
      ? `${Number(voucher.discountValue || 0).toLocaleString("id-ID")}%`
      : formatPrice(voucher.discountValue);
  const parts = [`Diskon ${discount}`];

  if (voucher.minSpend) {
    parts.push(`Min. ${formatPrice(voucher.minSpend)}`);
  }

  if (voucher.maxDiscount) {
    parts.push(`Maks. ${formatPrice(voucher.maxDiscount)}`);
  }

  return parts.join(" · ");
}

export default function VoucherSearchSelect({
  value = "",
  onChange,
  label = "Voucher",
  placeholder = "Cari kode atau nama voucher",
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const vouchersQuery = useActiveVouchers();
  const vouchers = vouchersQuery.data || [];

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const filteredVouchers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return vouchers;
    }

    return vouchers.filter((voucher) =>
      `${voucher.code} ${voucher.name}`.toLowerCase().includes(keyword),
    );
  }, [query, vouchers]);

  const selectedVoucher = vouchers.find(
    (voucher) => voucher.code.toUpperCase() === String(value).toUpperCase(),
  );

  const handleInput = (event) => {
    const nextValue = event.target.value.toUpperCase();
    setQuery(nextValue);
    onChange?.(nextValue);
    setOpen(true);
  };

  const selectVoucher = (voucher) => {
    setQuery(voucher.code);
    onChange?.(voucher.code);
    setOpen(false);
  };

  const clearVoucher = () => {
    setQuery("");
    onChange?.("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <div
        className={`flex min-h-11 items-center rounded-xl border bg-white transition ${
          open ? "border-[#10B981] ring-2 ring-emerald-100" : "border-slate-200"
        }`}
      >
        <Search size={17} className="ml-3 shrink-0 text-slate-400" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={handleInput}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-sm font-medium text-slate-800 outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={clearVoucher}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Hapus voucher"
          >
            <X size={16} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Buka pilihan voucher"
        >
          <ChevronDown
            size={17}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {selectedVoucher ? (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <Ticket size={16} className="mt-0.5 shrink-0 text-[#10B981]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#047857]">
              {selectedVoucher.code} · {selectedVoucher.name}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {getVoucherSummary(selectedVoucher)}
            </p>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {vouchersQuery.isLoading ? (
            <p className="px-3 py-5 text-center text-xs text-slate-500">
              Memuat voucher...
            </p>
          ) : null}

          {!vouchersQuery.isLoading && vouchersQuery.error ? (
            <p className="px-3 py-5 text-center text-xs text-red-500">
              Voucher gagal dimuat.
            </p>
          ) : null}

          {!vouchersQuery.isLoading &&
          !vouchersQuery.error &&
          !filteredVouchers.length ? (
            <p className="px-3 py-5 text-center text-xs text-slate-500">
              Voucher tidak ditemukan. Kode tetap dapat diketik manual.
            </p>
          ) : null}

          {filteredVouchers.map((voucher) => {
            const selected =
              voucher.code.toUpperCase() === String(value).toUpperCase();

            return (
              <button
                key={voucher.id || voucher.code}
                type="button"
                onClick={() => selectVoucher(voucher)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                  selected ? "bg-emerald-50" : "hover:bg-slate-50"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-[#10B981]">
                  <Ticket size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <strong className="truncate text-sm text-slate-900">
                      {voucher.code}
                    </strong>
                    {selected ? (
                      <Check size={15} className="shrink-0 text-[#10B981]" />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {voucher.name}
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {getVoucherSummary(voucher)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
