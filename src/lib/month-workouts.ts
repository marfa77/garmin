import type { DailySummary, DashboardData, MonthWorkoutTotals, MonthWorkouts, WorkoutSummary } from "./types";

function monthKey(ref: string): string {
  return ref.slice(0, 7);
}

function dedupeWorkouts(workouts: WorkoutSummary[]): WorkoutSummary[] {
  const seen = new Set<string>();
  const out: WorkoutSummary[] = [];
  for (const w of workouts) {
    const key =
      w.activityId != null
        ? String(w.activityId)
        : `${w.date ?? ""}|${w.name}|${w.startTime ?? ""}|${w.durationMin}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

export function collectMonthWorkoutsFromHistory(
  history: DailySummary[],
  month: string,
): WorkoutSummary[] {
  const items: WorkoutSummary[] = [];
  for (const day of history) {
    if (!day.date.startsWith(month)) continue;
    for (const w of day.strain.workouts) {
      items.push({ ...w, date: w.date ?? day.date });
    }
  }
  return dedupeWorkouts(items).sort((a, b) => {
    const da = `${a.date ?? ""} ${a.startTime ?? ""}`;
    const db = `${b.date ?? ""} ${b.startTime ?? ""}`;
    return db.localeCompare(da);
  });
}

export function resolveMonthWorkouts(data: DashboardData): MonthWorkouts {
  const month = monthKey(data.today.date);
  if (data.monthWorkouts?.month === month && data.monthWorkouts.workouts.length > 0) {
    return data.monthWorkouts;
  }
  return { month, workouts: collectMonthWorkoutsFromHistory(data.history, month) };
}

export function aggregateMonthTotals(workouts: WorkoutSummary[]): MonthWorkoutTotals {
  const durationMin = workouts.reduce((s, w) => s + w.durationMin, 0);
  const distanceKm = workouts.reduce((s, w) => s + (w.distanceKm ?? 0), 0);
  const calories = workouts.reduce((s, w) => s + (w.calories ?? 0), 0);
  const strain = Math.round(workouts.reduce((s, w) => s + w.strain, 0) * 10) / 10;
  const weightedHr =
    durationMin > 0
      ? Math.round(workouts.reduce((s, w) => s + w.avgHr * w.durationMin, 0) / durationMin)
      : null;
  const avgPaceMinPerKm =
    distanceKm > 0 && durationMin > 0 ? Math.round((durationMin / distanceKm) * 100) / 100 : null;

  return {
    sessions: workouts.length,
    durationMin,
    distanceKm: distanceKm > 0 ? Math.round(distanceKm * 10) / 10 : null,
    calories: calories > 0 ? calories : null,
    strain,
    avgHr: weightedHr,
    avgPaceMinPerKm,
  };
}

export function monthLabel(month: string, locale: "en" | "ru"): string {
  const [year, mon] = month.split("-").map(Number);
  const d = new Date(year, mon - 1, 1);
  return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" });
}
