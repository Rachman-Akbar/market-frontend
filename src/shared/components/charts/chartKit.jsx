import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS_TICK = { fontSize: 11, fill: "#64748b", fontWeight: 700 };
const TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#0f172a" };
const TOOLTIP_CURSOR = { fill: "rgba(148,163,184,0.14)" };

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

  const data = useMemo(
    () => visible.map((group) => {
      const row = { label: group.label };
      series.forEach((item) => {
        row[item.key] = Math.max(0, Number(group.values?.[item.key] || 0));
      });
      return row;
    }),
    [visible, series],
  );

  if (!visible.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div style={{ width: "100%", height: Math.max(180, data.length * 68) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }} barCategoryGap={12}>
          <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} width={150} />
          <Tooltip cursor={TOOLTIP_CURSOR} contentStyle={TOOLTIP_STYLE} formatter={(value) => format(value)} />
          {series.map((item) => (
            <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color} radius={[0, 4, 4, 0]} maxBarSize={18} />
          ))}
        </BarChart>
      </ResponsiveContainer>
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

  const data = useMemo(
    () => visible.map((day) => ({
      date: String(day.date || "").slice(5),
      fullDate: day.date,
      income: day.income,
      expense: day.expense,
    })),
    [visible],
  );

  if (!visible.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Belum ada arus kas harian.</p>;
  }

  return (
    <div style={{ width: "100%", height: 256 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis tick={false} axisLine={false} tickLine={false} width={8} />
          <Tooltip
            cursor={TOOLTIP_CURSOR}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => format(value)}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
          />
          <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expense" name="Pengeluaran" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrderRevenueBars({ points = [], format = (value) => String(value), maxDays = 45 }) {
  const visible = useMemo(() => {
    const parsed = (points || []).map((point) => ({
      ...point,
      orders: Number(point.orders || 0),
      revenue: Number(point.revenue || 0),
    }));
    return parsed.slice(Math.max(0, parsed.length - maxDays));
  }, [points, maxDays]);

  if (!visible.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Belum ada data tren.</p>;
  }

  return (
    <div>
      <SeriesLegend series={[{ key: "orders", label: "Order", color: "#818CF8" }, { key: "revenue", label: "Pendapatan", color: "#34D399" }]} />
      <div className="mt-3" style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis yAxisId="revenue" tick={false} axisLine={false} tickLine={false} width={8} />
            <YAxis yAxisId="orders" orientation="right" tick={false} axisLine={false} tickLine={false} width={8} />
            <Tooltip
              cursor={TOOLTIP_CURSOR}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => (name === "Pendapatan" ? format(value) : value)}
            />
            <Bar yAxisId="revenue" dataKey="revenue" name="Pendapatan" fill="#34D399" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Line yAxisId="orders" type="monotone" dataKey="orders" name="Order" stroke="#818CF8" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
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

export function DonutChart({ items = [], format = (value) => String(value), size = 168, thickness = 22, centerLabel = "", centerValue = "", emptyText = "Belum ada data." }) {
  const segments = useMemo(() => {
    const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.value || 0)), 0);
    if (total <= 0) return [];
    return items
      .filter((item) => Number(item.value || 0) > 0)
      .map((item, index) => {
        const value = Math.max(0, Number(item.value || 0));
        return {
          key: `${item.label}-${index}`,
          label: item.label || "Item",
          color: item.color || "#cbd5e1",
          value,
          fraction: value / total,
        };
      });
  }, [items]);

  if (!segments.length) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyText}</p>;
  }

  const innerRadius = Math.max(1, size / 2 - thickness);
  const outerRadius = size / 2;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={centerLabel || "Diagram lingkaran"}>
        <PieChart width={size} height={size}>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={segments.length > 1 ? 2 : 0}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {segments.map((segment) => (
              <Cell key={segment.key} fill={segment.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => format(value)} />
        </PieChart>
        {centerLabel || centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerLabel ? <p className="max-w-[104px] truncate text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{centerLabel}</p> : null}
            {centerValue ? <p className="max-w-[104px] truncate text-base font-black text-slate-900">{centerValue}</p> : null}
          </div>
        ) : null}
      </div>
      <div className="min-w-44 flex-1 space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="min-w-0 flex-1 truncate font-bold text-slate-700">{segment.label}</span>
            <span className="shrink-0 font-extrabold text-slate-900">{format(segment.value)}</span>
            <span className="w-10 shrink-0 text-right font-semibold text-slate-400">{Math.round(segment.fraction * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
