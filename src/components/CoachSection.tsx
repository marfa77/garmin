"use client";

import { useI18n } from "@/lib/i18n";
import type { CoachMessage } from "@/lib/coach-types";
import type { TrainingBalance } from "@/lib/training-balance";

const trainingAccent: Record<TrainingBalance["status"], string> = {
  on_track: "border-emerald-500/30 bg-emerald-950/25 text-emerald-300",
  undertraining: "border-sky-500/30 bg-sky-950/25 text-sky-300",
  overtraining: "border-amber-500/30 bg-amber-950/25 text-amber-300",
  recover: "border-zinc-600/40 bg-zinc-900/50 text-zinc-300",
};

export function CoachSection({
  label,
  coach,
  training,
  accent = "zinc",
}: {
  label?: string;
  coach: CoachMessage;
  training?: TrainingBalance;
  accent?: "emerald" | "amber" | "rose" | "sky" | "zinc";
}) {
  const { t } = useI18n();
  const accentClass = {
    emerald: "border-emerald-500/25 from-emerald-950/30",
    amber: "border-amber-500/25 from-amber-950/30",
    rose: "border-rose-500/25 from-rose-950/30",
    sky: "border-sky-500/25 from-sky-950/30",
    zinc: "border-zinc-700/50 from-zinc-900/50",
  }[accent];

  return (
    <div className={`h-full rounded-2xl border bg-gradient-to-br to-zinc-950 p-5 ${accentClass}`}>
      {label && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      )}
      <h3 className={`font-semibold text-white ${label ? "mt-2 text-xl" : "text-lg"}`}>
        {coach.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{coach.insight}</p>

      {training && (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${trainingAccent[training.status]}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
            {t.coachSection.training}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{training.label}</p>
          <p className="mt-1 text-sm leading-snug opacity-90">{training.detail}</p>
        </div>
      )}

      {coach.watchouts && coach.watchouts.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {t.coachSection.watchouts}
          </p>
          <ul className="mt-2 space-y-2">
            {coach.watchouts.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-snug text-zinc-400">
                <span className="mt-0.5 shrink-0 text-amber-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {coach.action && (
        <p className="mt-4 border-t border-zinc-800/80 pt-4 text-sm font-medium text-zinc-200">
          → {coach.action}
        </p>
      )}
    </div>
  );
}
