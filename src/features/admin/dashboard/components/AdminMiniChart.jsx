import { useId, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartFrame } from "@/shared/components/charts/ChartFrame";

const TYPES = ["area", "line", "column"];

export function AdminMiniChart({ values = [] }) {
  const [type, setType] = useState("area");
  const [fullscreen, setFullscreen] = useState(false);
  const gradientId = useId();

  const data = values.map((value, index) => ({ name: String(index + 1), value: Number(value || 0) }));
  const empty = !data.length;
  const height = fullscreen ? "100%" : 256;

  const tooltip = (
    <Tooltip
      cursor={{ stroke: "rgba(148,163,184,0.4)" }}
      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }}
      formatter={(value) => Number(value).toLocaleString("id-ID")}
    />
  );
  const xAxis = <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} />;

  let chart = null;
  if (!empty) {
    if (type === "line") {
      chart = (
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          {xAxis}
          {tooltip}
          <Line type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      );
    } else if (type === "column") {
      chart = (
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          {xAxis}
          {tooltip}
          <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      );
    } else {
      chart = (
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0D9488" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {xAxis}
          {tooltip}
          <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={2} fill={`url(#${gradientId})`} />
        </AreaChart>
      );
    }
  }

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Tren pendapatan</h2>
          <p className="text-sm text-slate-500">12 bulan terakhir</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Data API</span>
      </div>
      <ChartFrame
        types={TYPES}
        type={type}
        onTypeChange={setType}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((value) => !value)}
        empty={empty}
        emptyText="Belum ada data."
      >
        <div className="rounded-[10px] bg-slate-50 p-4" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}
