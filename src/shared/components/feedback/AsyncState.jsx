import { memo } from "react";

export const AsyncState = memo(function AsyncState({
  loading,
  error,
  empty,
  emptyText = "Data belum tersedia.",
  loadingText = "Memuat data...",
}) {
  if (loading) {
    return <p className="py-8 text-sm text-slate-500">{loadingText}</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        {error}
      </p>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return null;
});
