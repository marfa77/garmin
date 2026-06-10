import type { Dictionary } from "./i18n/types";
import type { HrZoneMinutes, WorkoutSummary } from "./types";

const ZONE_COLORS = ["#3f3f46", "#22c55e", "#eab308", "#f97316", "#ef4444"] as const;

export function activityTypeLabel(type: string, t: Dictionary): string {
  const key = type as keyof typeof t.strain.activityTypes;
  return t.strain.activityTypes[key] ?? type.replace(/_/g, " ");
}

export function formatPace(minPerKm: number): string {
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function hrZonePercents(zones: HrZoneMinutes): number[] {
  const values = [zones.z1, zones.z2, zones.z3, zones.z4, zones.z5];
  const total = values.reduce((s, v) => s + v, 0);
  if (total <= 0) return values.map(() => 0);
  return values.map((v) => Math.round((v / total) * 100));
}

export function hrZoneColor(index: number): string {
  return ZONE_COLORS[index] ?? ZONE_COLORS[0];
}

export function workoutShareOfDay(workout: WorkoutSummary, dayStrain: number): number | null {
  if (dayStrain <= 0 || workout.strain <= 0) return null;
  return Math.round((workout.strain / dayStrain) * 100);
}

export function hasWorkoutStats(workout: WorkoutSummary): boolean {
  return (
    workout.maxHr != null ||
    workout.calories != null ||
    workout.distanceKm != null ||
    workout.hrZones != null ||
    workout.paceMinPerKm != null
  );
}

export function workoutKey(workout: WorkoutSummary, index: number): string {
  return workout.activityId != null
    ? String(workout.activityId)
    : `${workout.date ?? ""}-${workout.name}-${workout.startTime ?? ""}-${workout.durationMin}-${index}`;
}

export function formatWorkoutWhen(
  date: string,
  startTime: string | undefined,
  locale: "en" | "ru",
): { date: string; time?: string } {
  const d = new Date(`${date}T12:00:00`);
  const dateLabel = d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
  });
  return { date: dateLabel, time: startTime };
}

export function aggregateWorkouts(workouts: WorkoutSummary[]) {
  const durationMin = workouts.reduce((s, w) => s + w.durationMin, 0);
  const calories = workouts.reduce((s, w) => s + (w.calories ?? 0), 0);
  const distanceKm = workouts.reduce((s, w) => s + (w.distanceKm ?? 0), 0);
  const weightedHr =
    durationMin > 0
      ? Math.round(workouts.reduce((s, w) => s + w.avgHr * w.durationMin, 0) / durationMin)
      : 0;
  const maxHr = workouts.reduce((m, w) => Math.max(m, w.maxHr ?? 0), 0);

  const hrZones = workouts.reduce(
    (acc, w) => {
      if (!w.hrZones) return acc;
      acc.z1 += w.hrZones.z1;
      acc.z2 += w.hrZones.z2;
      acc.z3 += w.hrZones.z3;
      acc.z4 += w.hrZones.z4;
      acc.z5 += w.hrZones.z5;
      return acc;
    },
    { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
  );
  const hasZones = hrZones.z1 + hrZones.z2 + hrZones.z3 + hrZones.z4 + hrZones.z5 > 0;

  return {
    count: workouts.length,
    durationMin,
    calories: calories > 0 ? calories : null,
    distanceKm: distanceKm > 0 ? Math.round(distanceKm * 10) / 10 : null,
    avgHr: weightedHr > 0 ? weightedHr : null,
    maxHr: maxHr > 0 ? maxHr : null,
    hrZones: hasZones ? hrZones : null,
  };
}
