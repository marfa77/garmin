"use client";

import { useI18n } from "@/lib/i18n";
import type { SleepSegment } from "@/lib/types";

const STAGE_COLOR: Record<SleepSegment["level"], string> = {
  deep: "bg-indigo-500",
  rem: "bg-sky-400",
  light: "bg-zinc-500",
  awake: "bg-amber-500/80",
};

export function SleepHypnogram({ segments, compact = false }: { segments: SleepSegment[]; compact?: boolean }) {
  const { t } = useI18n();
  const STAGE_LABEL: Record<SleepSegment["level"], string> = {
    deep: t.sleep.deep,
    rem: t.sleep.rem,
    light: t.sleep.light,
    awake: t.sleep.awake,
  };

  if (!segments.length) {
    return (
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 text-center text-xs text-zinc-600">
        {t.sleep.noHypnogram}
      </div>
    );
  }

  const total = segments.reduce((s, seg) => s + seg.minutes, 0);

  return (
    <div className={compact ? "" : "rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4"}>
      {!compact && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.sleep.architecture}</p>
      )}
      <div className="flex h-8 overflow-hidden rounded-lg bg-zinc-900">
        {segments.map((seg, i) => (
          <div
            key={`${seg.start ?? i}-${seg.level}`}
            className={STAGE_COLOR[seg.level]}
            style={{ flexGrow: Math.max(seg.minutes, 0.1) }}
            title={`${STAGE_LABEL[seg.level]} · ${seg.minutes}m`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] uppercase tracking-wider text-zinc-500">
        {(Object.keys(STAGE_LABEL) as SleepSegment["level"][]).map((level) => {
          const mins = segments.filter((s) => s.level === level).reduce((a, s) => a + s.minutes, 0);
          const pct = Math.round((mins / total) * 100);
          if (!mins || pct < 1) return null;
          return (
            <span key={level} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-sm ${STAGE_COLOR[level]}`} />
              {STAGE_LABEL[level]} {pct}%
            </span>
          );
        })}
      </div>
    </div>
  );
}
