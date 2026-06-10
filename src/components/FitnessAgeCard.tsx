"use client";

import { useI18n } from "@/lib/i18n";

export function FitnessAgeCard({
  fitnessAge,
  chronologicalAge,
  vo2max,
  achievableFitnessAge,
  fitnessAgeSource,
  fitnessAgeTips,
}: {
  fitnessAge: number;
  chronologicalAge: number;
  vo2max: number;
  achievableFitnessAge?: number;
  fitnessAgeSource?: "garmin" | "estimate";
  fitnessAgeTips?: string[];
}) {
  const { t } = useI18n();
  const delta = chronologicalAge - fitnessAge;
  const younger = delta > 0;
  const fromGarmin = fitnessAgeSource === "garmin";

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-zinc-950 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.fitnessAge.title}</p>
        {fromGarmin && (
          <span className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            {t.common.garmin}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <span className="text-5xl font-semibold tabular-nums text-white">{fitnessAge}</span>
          <span className="ml-2 text-lg text-zinc-500">{t.common.years}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">{t.common.chronological}</p>
          <p className="text-lg font-medium text-zinc-300">{chronologicalAge}</p>
          {achievableFitnessAge != null && achievableFitnessAge < fitnessAge && (
            <p className="mt-1 text-xs text-emerald-400">
              {t.common.reachable} · {achievableFitnessAge}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-400">
        {younger
          ? t.fitnessAge.younger.replace("{delta}", String(delta)).replace("{vo2}", String(vo2max))
          : t.fitnessAge.aligned.replace("{vo2}", String(vo2max))}
      </p>
      {fitnessAgeTips && fitnessAgeTips.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-zinc-800/80 pt-3">
          {fitnessAgeTips.map((tip) => (
            <li key={tip} className="text-xs leading-relaxed text-zinc-500">
              → {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
