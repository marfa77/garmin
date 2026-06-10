"use client";

import { useI18n, translateReadinessLabel } from "@/lib/i18n";
import { READINESS_COLORS } from "@/lib/readiness";
import type { ReadinessZone } from "@/lib/types";

export function ReadinessCard({
  score,
  zone,
  label,
}: {
  score: number;
  zone: ReadinessZone;
  label: string;
}) {
  const { t } = useI18n();
  const colors = READINESS_COLORS[zone];
  const displayLabel = translateReadinessLabel(label, t);

  return (
    <div
      className="relative h-full overflow-hidden rounded-2xl border-0 p-5 lg:rounded-none lg:border-0"
      style={{
        background: `linear-gradient(135deg, ${colors.glow} 0%, rgba(9,9,11,0.95) 55%)`,
      }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl" style={{ background: colors.ring }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">{t.readiness.title}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <span className="text-5xl font-semibold tabular-nums text-white">{score}</span>
          <span className="ml-1 text-lg text-zinc-500">/100</span>
        </div>
        <span className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>{displayLabel}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${colors.ring}, ${colors.ring}99)` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t.readiness.desc}</p>
    </div>
  );
}
