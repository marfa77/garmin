"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import type { TimePoint } from "@/lib/types";

interface DayCurvesProps {
  bodyBattery: TimePoint[];
  stress: TimePoint[];
}

function mergeSeries(bodyBattery: TimePoint[], stress: TimePoint[]) {
  const map = new Map<string, { time: string; bodyBattery?: number; stress?: number }>();
  for (const p of bodyBattery) {
    map.set(p.time, { time: p.time, bodyBattery: p.value, stress: map.get(p.time)?.stress });
  }
  for (const p of stress) {
    const existing = map.get(p.time);
    map.set(p.time, { time: p.time, bodyBattery: existing?.bodyBattery, stress: p.value });
  }
  return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
}

export function DayCurves({ bodyBattery, stress }: DayCurvesProps) {
  const { t } = useI18n();
  const data = mergeSeries(bodyBattery, stress);
  const hasStress = stress.length > 0;

  return (
    <div className="h-full rounded-2xl border-0 bg-transparent p-5 lg:border lg:border-zinc-800/70 lg:bg-zinc-950/30">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.overview.energyToday}</p>
        <div className="flex gap-3 text-[10px] uppercase tracking-wider">
          <span className="text-emerald-400">● {t.overview.bodyBattery}</span>
          {hasStress && <span className="text-amber-400">● {t.overview.stress}</span>}
        </div>
      </div>
      <div className="h-56 min-h-[224px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} interval="preserveStartEnd" minTickGap={40} />
            <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "#09090b", border: "1px solid #3f3f46", borderRadius: 12 }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            {hasStress && (
              <Area type="monotone" dataKey="stress" stroke="#f59e0b" fill="url(#stressGrad)" strokeWidth={1.5} dot={false} name={t.overview.stress} connectNulls />
            )}
            <Area type="monotone" dataKey="bodyBattery" stroke="#34d399" fill="url(#bbGrad)" strokeWidth={2} dot={false} name={t.overview.bodyBattery} connectNulls />
            <Line type="monotone" dataKey="bodyBattery" stroke="#34d399" strokeWidth={2} dot={false} legendType="none" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
