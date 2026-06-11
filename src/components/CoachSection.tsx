"use client";

import { useCoachPersona } from "@/lib/coach-persona";
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
  variant = "compact",
}: {
  label?: string;
  coach: CoachMessage;
  training?: TrainingBalance;
  accent?: "emerald" | "amber" | "rose" | "sky" | "zinc";
  variant?: "compact" | "master";
}) {
  const { t } = useI18n();
  const { persona } = useCoachPersona();
  const isMaster = variant === "master";
  const isSarcastic = persona === "sarcastic";
  const accentClass = {
    emerald: "border-emerald-500/25 from-emerald-950/30",
    amber: "border-amber-500/25 from-amber-950/30",
    rose: "border-rose-500/25 from-rose-950/30",
    sky: "border-sky-500/25 from-sky-950/30",
    zinc: "border-zinc-700/50 from-zinc-900/50",
  }[accent];

  const careItems = coach.watchouts ?? [];
  const showTraining = training && !isMaster;

  return (
    <div
      className={`h-full rounded-2xl border bg-gradient-to-br to-zinc-950 ${isMaster ? "p-6 sm:p-7" : "p-5"} ${accentClass}`}
    >
      {label && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      )}
      <h3
        className={`font-semibold leading-snug text-white ${
          label ? (isMaster ? "mt-3 text-2xl sm:text-[1.65rem]" : "mt-2 text-xl") : "text-lg"
        }`}
      >
        {coach.headline}
      </h3>

      {isMaster && coach.progress && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            isSarcastic
              ? "border-amber-500/25 bg-amber-950/20"
              : "border-emerald-500/20 bg-emerald-950/20"
          }`}
        >
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              isSarcastic ? "text-amber-400/90" : "text-emerald-400/90"
            }`}
          >
            {isSarcastic ? t.coachSection.progressSarcastic : t.coachSection.progress}
          </p>
          <p
            className={`mt-1.5 text-sm leading-relaxed ${
              isSarcastic ? "text-amber-50/90" : "text-emerald-50/90"
            }`}
          >
            {coach.progress}
          </p>
        </div>
      )}

      <p className={`leading-relaxed text-zinc-300 ${isMaster ? "mt-4 text-[15px]" : "mt-2 text-sm"}`}>
        {coach.insight}
      </p>

      {isMaster && coach.dynamics && (
        <div
          className={`mt-5 border-l-2 pl-4 ${
            isSarcastic ? "border-rose-500/35" : "border-sky-500/40"
          }`}
        >
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              isSarcastic ? "text-rose-400/80" : "text-sky-400/80"
            }`}
          >
            {isSarcastic ? t.coachSection.dynamicsSarcastic : t.coachSection.dynamics}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{coach.dynamics}</p>
        </div>
      )}

      {showTraining && (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${trainingAccent[training.status]}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
            {t.coachSection.training}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{training.label}</p>
          <p className="mt-1 text-sm leading-snug opacity-90">{training.detail}</p>
        </div>
      )}

      {careItems.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {isMaster
              ? isSarcastic
                ? t.coachSection.careNotesSarcastic
                : t.coachSection.careNotes
              : t.coachSection.watchouts}
          </p>
          <ul className="mt-2 space-y-2">
            {careItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-snug text-zinc-400">
                <span className={`mt-0.5 shrink-0 ${isMaster ? "text-rose-300/70" : "text-amber-400"}`}>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {coach.action && (
        <div
          className={`mt-5 border-t border-zinc-800/80 pt-5 ${
            isMaster ? "rounded-xl bg-zinc-900/40 px-4 py-3" : ""
          }`}
        >
          {isMaster && (
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {isSarcastic ? t.coachSection.yourMoveSarcastic : t.coachSection.yourMove}
            </p>
          )}
          <p className={`font-medium text-zinc-100 ${isMaster ? "text-[15px] leading-relaxed" : "text-sm text-zinc-200"}`}>
            {isMaster ? coach.action : `→ ${coach.action}`}
          </p>
        </div>
      )}
    </div>
  );
}
