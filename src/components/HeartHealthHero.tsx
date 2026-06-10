"use client";

import { useI18n } from "@/lib/i18n";
import { IconHeart } from "./icons";

export function HeartHealthHero({
  vo2max,
  fitnessAge,
  chronologicalAge,
  hrv,
  rhr,
  respirationRate,
  insight,
  statusLabel,
}: {
  vo2max: number;
  fitnessAge: number;
  chronologicalAge: number;
  hrv: number;
  rhr: number;
  respirationRate?: number;
  insight: string;
  statusLabel: string;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-rose-500/15 bg-gradient-to-br from-rose-950/25 via-zinc-950 to-black p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHeart className="h-4 w-4 text-rose-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.heart.title}</span>
        </div>
        <span className="text-xs font-semibold uppercase text-emerald-400">{statusLabel}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="col-span-1 rounded-xl border border-zinc-800/80 bg-black/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t.heart.vo2}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-white">{vo2max}</p>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-black/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t.heart.hrv}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{hrv}</p>
          <p className="text-[10px] text-zinc-600">ms</p>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-black/40 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t.heart.rhr}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{rhr}</p>
          <p className="text-[10px] text-zinc-600">bpm</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>
          {t.heart.fitnessAge} <strong className="text-zinc-300">{fitnessAge}</strong>
        </span>
        <span>·</span>
        <span>
          {t.heart.chrono} <strong className="text-zinc-300">{chronologicalAge}</strong>
        </span>
        {respirationRate != null && (
          <>
            <span>·</span>
            <span>
              {t.heart.resp} <strong className="text-zinc-300">{respirationRate}</strong> br/min
            </span>
          </>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{insight}</p>
    </div>
  );
}
