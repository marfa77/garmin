"use client";

import { useI18n } from "@/lib/i18n";
import type { SleepTypicalRange } from "@/lib/sleep-contributors";
import { formatHoursMinutes } from "@/lib/week-history";
import type { DailySummary, SleepStage } from "@/lib/types";

const STAGE_COLOR: Record<SleepStage, string> = {
  deep: "bg-indigo-500",
  rem: "bg-sky-400",
  light: "bg-zinc-500",
  awake: "border border-zinc-500 bg-transparent",
};

export function SleepStageRows({
  today,
  typical,
}: {
  today: DailySummary;
  typical: SleepTypicalRange;
}) {
  const { t } = useI18n();
  const total = today.sleep.deepMin + today.sleep.remMin + today.sleep.lightMin + today.sleep.awakeMin || 1;

  const stages: { id: SleepStage; min: number; label: string; range: { min: number; max: number } }[] = [
    { id: "awake", min: today.sleep.awakeMin, label: t.sleep.awake, range: typical.awake },
    { id: "light", min: today.sleep.lightMin, label: t.sleep.light, range: typical.light },
    { id: "deep", min: today.sleep.deepMin, label: t.sleep.deep, range: typical.deep },
    { id: "rem", min: today.sleep.remMin, label: t.sleep.rem, range: typical.rem },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.sleep.lastNight}</p>
      <div className="space-y-4">
        {stages.map((s) => {
          const pct = Math.round((s.min / total) * 100);
          const barPct = Math.min(100, pct);
          const rangeLeft = s.range.min;
          const rangeWidth = Math.max(4, s.range.max - s.range.min);
          return (
            <div key={s.id}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-zinc-300">{s.label}</span>
                <span className="tabular-nums text-zinc-500">
                  {pct}% · {formatHoursMinutes(s.min)}
                </span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className="absolute inset-y-0 rounded-full border border-dashed border-zinc-600/60 bg-zinc-800/30"
                  style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
                  title={t.sleep.typicalRange}
                />
                <div
                  className={`relative h-full rounded-full ${STAGE_COLOR[s.id]}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-zinc-600">{t.sleep.typicalRange}</p>
    </div>
  );
}
