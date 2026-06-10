"use client";

import dynamic from "next/dynamic";
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
}: {
  bodyBattery: TimePoint[];
  stress: TimePoint[];
}) {
  if (bodyBattery.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Today&apos;s energy</p>
        <p className="mt-4 text-sm text-zinc-500">No Body Battery data for today yet.</p>
      </div>
    );
  }

  return <DayCurves bodyBattery={bodyBattery} stress={stress} />;
}
