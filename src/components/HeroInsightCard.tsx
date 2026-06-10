"use client";

import type { HeroInsight } from "@/lib/hero-insights";

const zoneAccent: Record<HeroInsight["zone"], string> = {
  green: "border-emerald-500/25 from-emerald-950/20",
  yellow: "border-amber-500/25 from-amber-950/20",
  red: "border-rose-500/25 from-rose-950/20",
};

export function HeroInsightCard({ insight }: { insight: HeroInsight }) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br to-zinc-950 p-5 ${zoneAccent[insight.zone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-white">{insight.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{insight.body}</p>
        </div>
        {insight.badge && (
          <div className="flex shrink-0 flex-col items-center rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-2">
            <span className="text-emerald-400">✓</span>
            <span className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {insight.badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
