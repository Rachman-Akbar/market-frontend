import { useMemo } from "react";

export function legendDot(color) {
  return <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />;
}

export function SeriesLegend({ series }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {series.map((item) => (
        <span key={item.key} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          {legendDot(item.color)}
          {item.label}
        </span>
      ))}
    </div>
  );
}

function groupTotal(group, series) {
  return series.reduce((sum, item) => sum + Math.max(0, Number(group.values?.[item.key] || 0)), 0);
}

export function SeriesBarList({ groups = [], series = [], format = (value) => String(value), maxBars = 15, emptyText = "Belum ada data." }) {
  const visible = useMemo(() => {
    if (!series.length) return [];
    return [...groups]
      .map((group) => ({ ...group, _total: groupTotal(group, series) }))
      .sort((a, b) => b._total - a._total)
      .slice(0, maxBars);
  }, [groups, series, maxBars]);

  const max = useMemo(
    () => Math.max(1, ...visible.flatMap((group) => series.map((item) => Number(group.values?.[item.key] || 0)))),
    [visible, series],
  );

  if (!visible.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-5">
      {visible.map((group) => (
        <div key={group.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 truncate text-sm font-extrabold text-slate-800" title={group.label}>{group.label}</p>
          <div className="space-y-1.5">
            {series.map((item) => {
              const value = Math.max(0, Number(group.values?.[item.key] || 0));
              const width = value > 0 ? Math.max(6, (value / max) * 100) : 0;
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="w-32 shrink-0 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-white ring-1 ring-inset ring-slate-200">
                    <div className="h-full rounded transition-all" style={{ width: `${width}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="w-24 shrink-0 text-right text-[11px] font-bold text-slate-800">{format(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DailyCashflowBars({ days = [], format = (value) => String(value), maxDays = 14 }) {
  const visible = useMemo(() => {
    const parsed = (days || [])
      .map((day) => ({
        ...day,
        income: Number(day.income || 0),
        expense: Number(day.expense || 0),
      }))
      .filter((day) => day.income > 0 || day.expense > 0);
    return parsed.slice(Math.max(0, parsed.length - maxDays));
  }, [days, maxDays]);

  const max = useMemo(
    () => Math.max(1, ...visible.flatMap((day) => [day.income, day.expense])),
    [visible],
  );

  if (!visible.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Belum ada arus kas harian.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex h-56 min-w-max items-end gap-2 rounded-xl bg-slate-50 p-3">
        {visible.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${day.date}\nMasuk ${format(day.income)}\nKeluar ${format(day.expense)}`}>
            <div className="flex h-40 items-end gap-1">
              <div className="w-3 rounded-t bg-emerald-500" style={{ height: `${day.income > 0 ? Math.max(6, (day.income / max) * 158) : 0}px` }} />
              <div className="w-3 rounded-t bg-rose-400" style={{ height: `${day.expense > 0 ? Math.max(6, (day.expense / max) * 158) : 0}px` }} />
            </div>
            <span className="text-[9px] font-bold text-slate-400">{String(day.date).slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCard({ label, value, tone = "slate", hint }) {
  const tones = {
    slate: "bg-white ring-slate-200 text-slate-900",
    emerald: "bg-emerald-50 ring-emerald-200 text-emerald-800",
    rose: "bg-rose-50 ring-rose-200 text-rose-800",
    amber: "bg-amber-50 ring-amber-200 text-amber-800",
    sky: "bg-sky-50 ring-sky-200 text-sky-800",
  };
  return (
    <div className={`rounded-xl px-4 py-3 ring-1 ring-inset ${tones[tone] || tones.slate}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 truncate text-lg font-black">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] font-semibold opacity-60">{hint}</p> : null}
    </div>
  );
}