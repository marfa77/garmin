"use client";

import { useI18n } from "@/lib/i18n";
import {
  activityTypeLabel,
  aggregateWorkouts,
  hrZoneColor,
  hrZonePercents,
  workoutKey,
} from "@/lib/workout-stats";
import type { HrZoneMinutes, WorkoutSummary } from "@/lib/types";

function StatCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-zinc-900/70 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-zinc-500">{unit}</span>}
      </p>
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
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {percents.map((pct, i) =>
          pct > 0 ? (
            <span key={labels[i]} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hrZoneColor(i) }} />
              {labels[i]} {pct}%
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

export function WorkoutStatsPanel({ workouts }: { workouts: WorkoutSummary[] }) {
  const { t } = useI18n();

  if (workouts.length === 0) {
    return <p className="text-sm text-zinc-500">{t.strain.noWorkouts}</p>;
  }

  const agg = aggregateWorkouts(workouts);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCell label={t.strain.sessions} value={String(agg.count)} />
        <StatCell label={t.strain.totalDuration} value={String(agg.durationMin)} unit={t.common.min} />
        {agg.avgHr != null && <StatCell label={t.strain.avgHr} value={String(agg.avgHr)} unit="bpm" />}
        {agg.maxHr != null && <StatCell label={t.strain.maxHr} value={String(agg.maxHr)} unit="bpm" />}
        {agg.distanceKm != null && (
          <StatCell label={t.strain.distance} value={agg.distanceKm.toFixed(1)} unit="km" />
        )}
        {agg.calories != null && (
          <StatCell label={t.strain.calories} value={String(agg.calories)} unit="kcal" />
        )}
      </div>

      {agg.hrZones && <HrZoneBar zones={agg.hrZones} />}

      {workouts.length > 1 && (
        <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-4">
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
