"use client";

import { useState } from "react";
import { hasLlmCoach, coachTimelineDays, recoveryZoneClass, resolveDayCoach } from "@/lib/coach-history";
import { useCoachPersona } from "@/lib/coach-persona";
import { useI18n } from "@/lib/i18n";
import { resolveWeeklyNarrative } from "@/lib/interpretations";
import { zoneLabel } from "@/lib/whoop-copy";
import type { DashboardData } from "@/lib/types";

function formatDayDate(date: string, locale: "en" | "ru", todayDate: string): string {
  if (date === todayDate) return "";
  return new Date(date).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function CoachTimeline({ data, days = 7 }: { data: DashboardData; days?: number }) {
  const { t, locale } = useI18n();
  const { persona } = useCoachPersona();
  const [expanded, setExpanded] = useState<string | null>(null);
  const timeline = coachTimelineDays(data.history, days);
  const weekStory =
    locale === "ru" && data.weekly.narrativeRu?.trim()
      ? data.weekly.narrativeRu.trim()
      : resolveWeeklyNarrative(data.weekly, t);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {t.coachTimeline.weekStory}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-200">{weekStory}</p>
      </div>

      <div className="space-y-3">
        {timeline.map((day, index) => {
          const coach = resolveDayCoach(day, t, locale, persona);
          const isToday = day.date === data.today.date;
          const isOpen = expanded === day.date;
          const llm = hasLlmCoach(day.coach, persona);
          const dateLabel = isToday
            ? t.coachTimeline.today
            : formatDayDate(day.date, locale, data.today.date);

          return (
            <article
              key={day.date}
              className={`rounded-2xl border transition ${
                isToday
                  ? "border-zinc-600/60 bg-zinc-900/70"
                  : "border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700/70"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : day.date)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${recoveryZoneClass(day.recovery.zone)}`}
                  >
                    {day.recovery.score}
                  </span>
                  {index < timeline.length - 1 && (
                    <span className="mt-2 h-full min-h-[2rem] w-px bg-zinc-800" aria-hidden />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium text-zinc-400">
                      {dateLabel || day.date}
                      {!isToday && (
                        <span className="ml-2 text-zinc-600">
                          · {t.rings.sleep} {day.sleep.score}% · {t.rings.strain}{" "}
                          {day.strain.current.toFixed(1)}
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                      {zoneLabel(day.recovery.zone, t)}
                    </span>
                    {!llm && (
                      <span className="text-[10px] text-zinc-600">{t.coachTimeline.ruleBased}</span>
                    )}
                  </div>
                  <h4 className="mt-1 text-base font-semibold text-white">{coach.headline}</h4>
                  <p className={`mt-1 text-sm leading-relaxed text-zinc-400 ${isOpen ? "" : "line-clamp-2"}`}>
                    {coach.insight}
                  </p>
                </div>

                <span className="shrink-0 pt-1 text-xs text-zinc-600">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-zinc-800/70 px-4 pb-4 pl-[3.25rem]">
                  {coach.progress && (
                    <p className="mt-3 text-sm leading-relaxed text-emerald-400/90">{coach.progress}</p>
                  )}
                  {coach.dynamics && (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">{coach.dynamics}</p>
                  )}
                  {coach.watchouts && coach.watchouts.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {coach.watchouts.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-zinc-500">
                          <span className="text-amber-500/80">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {coach.action && (
                    <p className="mt-3 text-sm font-medium text-zinc-300">→ {coach.action}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
