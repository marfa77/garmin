"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n";
import type { TimePoint } from "@/lib/types";

const DayCurves = dynamic(() => import("./DayCurves").then((m) => m.DayCurves), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 min-h-[224px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
      <p className="text-sm text-zinc-500">Loading chart…</p>
    </div>
  ),
});

export function DayCurvesClient({
  bodyBattery,
  stress,
  bodyBatteryNow,
  bodyBatteryMin,
  bodyBatteryMax,
}: {
  bodyBattery: TimePoint[];
  stress: TimePoint[];
  bodyBatteryNow?: number;
  bodyBatteryMin?: number;
  bodyBatteryMax?: number;
}) {
  const { t } = useI18n();

  if (bodyBattery.length > 0) {
    return <DayCurves bodyBattery={bodyBattery} stress={stress} />;
  }

  if (bodyBatteryNow && bodyBatteryNow > 0) {
    const min = bodyBatteryMin && bodyBatteryMin > 0 ? bodyBatteryMin : bodyBatteryNow;
    const max = bodyBatteryMax && bodyBatteryMax > 0 ? bodyBatteryMax : bodyBatteryNow;
    const nowLabel = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
    const fallbackCurve: TimePoint[] = [
      { time: "06:30", value: min },
      ...(max !== min ? [{ time: "14:00", value: max }] : []),
      { time: nowLabel, value: bodyBatteryNow },
    ];

    return (
      <div>
        <DayCurves bodyBattery={fallbackCurve} stress={stress} />
        <p className="px-5 pb-4 text-[11px] leading-relaxed text-zinc-600">{t.overview.bodyBatteryPartial}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.overview.energyToday}</p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-500">{t.overview.noBodyBatteryYet}</p>
      <p className="mt-2 text-xs text-zinc-600">{t.overview.noBodyBatteryHint}</p>
    </div>
  );
}
