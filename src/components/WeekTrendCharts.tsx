"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { shortDayLabel, weekChronological } from "@/lib/week-history";
import type { DailySummary } from "@/lib/types";

const RECOVERY_COLOR: Record<string, string> = {
  green: "#3ecf8e",
  yellow: "#fbbf24",
  red: "#f87171",
};

export function WeekTrendCharts({
  history,
  variant = "full",
  layout = "stack",
}: {
  history: DailySummary[];
  variant?: "full" | "overview" | "sleep";
  layout?: "stack" | "grid";
}) {
  const { t, locale } = useI18n();
  const days = weekChronological(history, 7);

  const sleepData = days.map((d) => ({
    day: shortDayLabel(d.date, locale),
    sleep: d.sleep.score,
    hours: Math.round(d.sleep.hours * 10) / 10,
    need: Math.round(d.sleep.need * 10) / 10,
  }));

  const balanceData = days.map((d) => ({
    day: shortDayLabel(d.date, locale),
    strain: d.strain.current,
    recovery: d.recovery.score,
    recoveryColor: RECOVERY_COLOR[d.recovery.zone] ?? "#3ecf8e",
  }));

  const showSleep = variant === "full" || variant === "overview" || variant === "sleep";
  const showBalance = variant === "full" || variant === "overview";
  const showHours = variant === "full" || variant === "sleep";

  const containerClass = layout === "grid" ? "grid grid-cols-1 gap-4 lg:grid-cols-2" : "space-y-4";

  return (
    <div className={containerClass}>
      {showSleep && (
      <div className={layout === "grid" ? "p-0" : "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4"}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {t.trends.sleepPerformance}
        </p>
        <div className="h-44 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sleepData}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid #3f3f46", borderRadius: 12 }}
                formatter={(value: number) => [`${value}%`, t.rings.sleep]}
              />
              <Bar dataKey="sleep" fill="#8ecae6" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {showBalance && (
      <div className={layout === "grid" ? "p-0" : "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4"}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {t.trends.strainRecovery}
        </p>
        <div className="h-44 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={balanceData}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis yAxisId="strain" stroke="#5b9bd5" fontSize={10} domain={[0, 21]} tickLine={false} width={24} />
              <YAxis
                yAxisId="recovery"
                orientation="right"
                stroke="#3ecf8e"
                fontSize={10}
                domain={[0, 100]}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid #3f3f46", borderRadius: 12 }}
              />
              <Bar yAxisId="strain" dataKey="strain" fill="#5b9bd5" radius={[4, 4, 0, 0]} maxBarSize={28} name={t.rings.strain} />
              <Line
                yAxisId="recovery"
                type="monotone"
                dataKey="recovery"
                stroke="#3ecf8e"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3ecf8e", strokeWidth: 0 }}
                name={t.rings.recovery}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[10px] uppercase tracking-wider text-zinc-500">
          <span className="text-sky-400">● {t.rings.strain}</span>
          <span className="text-emerald-400">● {t.rings.recovery}</span>
        </div>
      </div>
      )}

      {showHours && (
      <div className={layout === "grid" ? "p-0" : "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4"}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {t.trends.hoursVsNeeded}
        </p>
        <div className="h-44 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sleepData}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 10]} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid #3f3f46", borderRadius: 12 }}
                formatter={(v: number, name: string) => [`${v}h`, name === "hours" ? t.trends.hoursSlept : t.trends.hoursNeeded]}
              />
              <Bar dataKey="hours" fill="#8ecae6" radius={[4, 4, 0, 0]} maxBarSize={24} name="hours" />
              <Line type="monotone" dataKey="need" stroke="#3ecf8e" strokeWidth={2} dot={{ r: 3, fill: "#3ecf8e" }} name="need" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[10px] uppercase tracking-wider text-zinc-500">
          <span className="text-sky-300">● {t.trends.hoursSlept}</span>
          <span className="text-emerald-400">● {t.trends.hoursNeeded}</span>
        </div>
      </div>
      )}
    </div>
  );
}
