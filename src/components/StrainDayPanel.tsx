"use client";

import { useI18n } from "@/lib/i18n";
import {
  activityTypeLabel,
  aggregateWorkouts,
  hrZoneColor,
  hrZonePercents,
  workoutKey,
} from "@/lib/workout-stats";
import type { DailyActivity, HrZoneMinutes, WorkoutSummary } from "@/lib/types";

function StatCell({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-zinc-900/70 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-zinc-500">{unit}</span>}
      </p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function HrZoneBar({ zones }: { zones: HrZoneMinutes }) {
  const { t } = useI18n();
  const percents = hrZonePercents(zones);
  const labels = [t.strain.zone1, t.strain.zone2, t.strain.zone3, t.strain.zone4, t.strain.zone5];

  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">{t.strain.hrZones}</p>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-800">
        {percents.map((pct, i) =>
          pct > 0 ? (
            <div
              key={labels[i]}
              className="h-full"
              style={{ width: `${pct}%`, backgroundColor: hrZoneColor(i) }}
              title={`${labels[i]} ${pct}%`}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

export function StrainDayPanel({
  workouts,
  dailyActivity,
  workoutStrain,
  lifestyleStrain,
  currentStrain,
}: {
  workouts: WorkoutSummary[];
  dailyActivity?: DailyActivity;
  workoutStrain?: number;
  lifestyleStrain?: number;
  currentStrain: number;
}) {
  const { t } = useI18n();
  const agg = workouts.length > 0 ? aggregateWorkouts(workouts) : null;
  const stepsPct =
    dailyActivity && dailyActivity.stepGoal > 0
      ? Math.round((dailyActivity.steps / dailyActivity.stepGoal) * 100)
      : null;

  return (
    <div className="space-y-4">
      {(workoutStrain != null || lifestyleStrain != null) && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t.strain.strainBreakdown}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
            <span className="text-2xl font-semibold text-white">{currentStrain.toFixed(1)}</span>
            {workoutStrain != null && (
              <span className="text-zinc-400">
                {t.strain.workoutStrain}: <span className="font-medium text-sky-400">{workoutStrain.toFixed(1)}</span>
              </span>
            )}
            {lifestyleStrain != null && lifestyleStrain > 0 && (
              <span className="text-zinc-400">
                {t.strain.lifestyleStrain}:{" "}
                <span className="font-medium text-emerald-400">{lifestyleStrain.toFixed(1)}</span>
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">{t.strain.strainBreakdownHint}</p>
        </div>
      )}

      {dailyActivity && (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">{t.strain.dailyMovement}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCell
              label={t.strain.steps}
              value={dailyActivity.steps.toLocaleString()}
              hint={
                stepsPct != null
                  ? `${stepsPct}% ${t.strain.ofGoal} · ${dailyActivity.stepGoal.toLocaleString()}`
                  : undefined
              }
            />
            {dailyActivity.distanceKm != null && dailyActivity.distanceKm > 0 && (
              <StatCell
                label={t.strain.dayDistance}
                value={dailyActivity.distanceKm.toFixed(1)}
                unit="km"
              />
            )}
            <StatCell
              label={t.strain.activeCalories}
              value={String(dailyActivity.activeCalories)}
              unit="kcal"
              hint={t.strain.activeCaloriesHint}
            />
            <StatCell
              label={t.strain.restCalories}
              value={String(dailyActivity.bmrCalories)}
              unit="kcal"
              hint={t.strain.restCaloriesHint}
            />
            <StatCell
              label={t.strain.totalCalories}
              value={String(dailyActivity.totalCalories)}
              unit="kcal"
            />
          </div>
        </div>
      )}

      {agg && (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">{t.strain.workoutStats}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCell label={t.strain.sessions} value={String(agg.count)} />
            <StatCell label={t.strain.totalDuration} value={String(agg.durationMin)} unit={t.common.min} />
            {agg.avgHr != null && <StatCell label={t.strain.avgHr} value={String(agg.avgHr)} unit="bpm" />}
            {agg.calories != null && (
              <StatCell label={t.strain.workoutCalories} value={String(agg.calories)} unit="kcal" />
            )}
          </div>
          {agg.hrZones && <HrZoneBar zones={agg.hrZones} />}
        </div>
      )}

      {!dailyActivity && workouts.length === 0 && (
        <p className="text-sm text-zinc-500">{t.strain.noWorkouts}</p>
      )}

      {workouts.length > 1 && (
        <div className="space-y-2 border-t border-zinc-800/80 pt-4">
          {workouts.map((w, i) => (
            <div key={workoutKey(w, i)} className="flex items-center justify-between text-sm">
              <span className="truncate text-zinc-300">{w.name}</span>
              <span className="shrink-0 text-zinc-500">
                {w.durationMin} {t.common.min} · {activityTypeLabel(w.type, t)} ·{" "}
                <span className="font-medium text-sky-400">{w.strain.toFixed(1)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
