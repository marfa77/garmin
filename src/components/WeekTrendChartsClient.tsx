"use client";

import dynamic from "next/dynamic";
import type { DailySummary } from "@/lib/types";

const WeekTrendCharts = dynamic(() => import("./WeekTrendCharts").then((m) => m.WeekTrendCharts), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex h-52 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950"
        >
          <p className="text-sm text-zinc-500">…</p>
        </div>
      ))}
    </div>
  ),
});

export function WeekTrendChartsClient({
  history,
  variant = "full",
  layout = "stack",
}: {
  history: DailySummary[];
  variant?: "full" | "overview" | "sleep";
  layout?: "stack" | "grid";
}) {
  if (history.length < 2) return null;
  return <WeekTrendCharts history={history} variant={variant} layout={layout} />;
}
