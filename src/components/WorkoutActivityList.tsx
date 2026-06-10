"use client";

import { useI18n } from "@/lib/i18n";
import type { MonthWorkoutTotals } from "@/lib/types";
import {
  activityTypeLabel,
  formatPace,
  formatWorkoutWhen,
  workoutKey,
} from "@/lib/workout-stats";
import type { WorkoutSummary } from "@/lib/types";

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 text-sm ${className}`}>{children}</td>;
}

function formatDistance(km: number | null | undefined): string {
  if (km == null || km <= 0) return "—";
  return `${km.toFixed(1)} km`;
}

function formatPaceCell(pace: number | null | undefined): string {
  if (pace == null || pace <= 0) return "—";
  return `${formatPace(pace)}/km`;
}

function formatHr(hr: number | null | undefined): string {
  if (hr == null || hr <= 0) return "—";
  return `${hr} bpm`;
}

function formatCalories(kcal: number | null | undefined): string {
  if (kcal == null || kcal <= 0) return "—";
  return String(kcal);
}

export function WorkoutActivityList({
  workouts,
  totals,
  monthLabel,
}: {
  workouts: WorkoutSummary[];
  totals?: MonthWorkoutTotals;
  monthLabel?: string;
}) {
  const { t, locale } = useI18n();

  if (workouts.length === 0) {
    return <p className="text-sm text-zinc-500">{t.strain.noWorkoutsMonth}</p>;
  }

  return (
    <>
      {monthLabel && (
        <p className="mb-3 text-xs text-zinc-500">
          {t.strain.monthScope.replace("{month}", monthLabel)}
        </p>
      )}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-semibold">{t.strain.colWhen}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colActivity}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colType}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colDuration}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colDistance}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colPace}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colAvgHr}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colMaxHr}</th>
              <th className="px-3 py-2 font-semibold">{t.strain.colCalories}</th>
              <th className="px-3 py-2 text-right font-semibold">{t.strain.colStrain}</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w, i) => {
              const when = formatWorkoutWhen(w.date ?? "", w.startTime, locale);
              return (
                <tr
                  key={workoutKey(w, i)}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/40"
                >
                  <Cell className="whitespace-nowrap text-zinc-400">
                    <span className="text-white">{when.date}</span>
                    {when.time && <span className="ml-1.5 text-zinc-500">{when.time}</span>}
                  </Cell>
                  <Cell className="max-w-[180px] truncate font-medium text-white">{w.name}</Cell>
                  <Cell className="text-zinc-400">{activityTypeLabel(w.type, t)}</Cell>
                  <Cell className="text-zinc-300">
                    {w.durationMin} {t.common.min}
                  </Cell>
                  <Cell className="text-zinc-400">{formatDistance(w.distanceKm)}</Cell>
                  <Cell className="text-zinc-400">{formatPaceCell(w.paceMinPerKm)}</Cell>
                  <Cell className="text-zinc-300">{formatHr(w.avgHr)}</Cell>
                  <Cell className="text-zinc-400">{formatHr(w.maxHr)}</Cell>
                  <Cell className="text-zinc-400">{formatCalories(w.calories)}</Cell>
                  <Cell className="text-right font-semibold text-sky-400">{w.strain.toFixed(1)}</Cell>
                </tr>
              );
            })}
            {totals && (
              <tr className="border-t border-zinc-700/80 bg-zinc-900/60 font-medium">
                <td colSpan={2} className="px-3 py-3 text-sm text-white">
                  {t.strain.monthTotal}
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    {totals.sessions} {t.strain.sessionsUnit}
                  </span>
                </td>
                <Cell className="text-zinc-500">—</Cell>
                <Cell className="text-white">
                  {totals.durationMin} {t.common.min}
                </Cell>
                <Cell className="text-white">{formatDistance(totals.distanceKm)}</Cell>
                <Cell className="text-white">{formatPaceCell(totals.avgPaceMinPerKm)}</Cell>
                <Cell className="text-white">{formatHr(totals.avgHr)}</Cell>
                <Cell className="text-zinc-500">—</Cell>
                <Cell className="text-white">{formatCalories(totals.calories)}</Cell>
                <Cell className="text-right font-semibold text-sky-300">{totals.strain.toFixed(1)}</Cell>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {workouts.map((w, i) => {
          const when = formatWorkoutWhen(w.date ?? "", w.startTime, locale);
          return (
            <article
              key={workoutKey(w, i)}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-white">{w.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {when.date}
                    {when.time ? ` · ${when.time}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-semibold text-sky-400">{w.strain.toFixed(1)}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-zinc-500">{t.strain.colType}</dt>
                  <dd className="text-zinc-300">{activityTypeLabel(w.type, t)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colDuration}</dt>
                  <dd className="text-zinc-300">
                    {w.durationMin} {t.common.min}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colDistance}</dt>
                  <dd className="text-zinc-300">{formatDistance(w.distanceKm)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colPace}</dt>
                  <dd className="text-zinc-300">{formatPaceCell(w.paceMinPerKm)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colAvgHr}</dt>
                  <dd className="text-zinc-300">{formatHr(w.avgHr)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colMaxHr}</dt>
                  <dd className="text-zinc-300">{formatHr(w.maxHr)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t.strain.colCalories}</dt>
                  <dd className="text-zinc-300">
                    {w.calories != null && w.calories > 0 ? `${w.calories} kcal` : "—"}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}

        {totals && (
          <article className="rounded-xl border border-sky-500/20 bg-sky-950/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400/80">
              {t.strain.monthTotal}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-zinc-500">{t.strain.sessions}</dt>
                <dd className="font-medium text-white">{totals.sessions}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colDuration}</dt>
                <dd className="font-medium text-white">
                  {totals.durationMin} {t.common.min}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colDistance}</dt>
                <dd className="font-medium text-white">{formatDistance(totals.distanceKm)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colPace}</dt>
                <dd className="font-medium text-white">{formatPaceCell(totals.avgPaceMinPerKm)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colAvgHr}</dt>
                <dd className="font-medium text-white">{formatHr(totals.avgHr)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colCalories}</dt>
                <dd className="font-medium text-white">
                  {totals.calories != null ? `${totals.calories} kcal` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">{t.strain.colStrain}</dt>
                <dd className="font-semibold text-sky-300">{totals.strain.toFixed(1)}</dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </>
  );
}
