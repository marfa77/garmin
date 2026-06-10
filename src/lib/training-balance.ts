import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import type { DailySummary } from "./types";

export type TrainingStatus = "on_track" | "undertraining" | "overtraining" | "recover";

export interface TrainingBalance {
  status: TrainingStatus;
  label: string;
  detail: string;
  workoutsToday: number;
  workoutMin: number;
  strain: number;
  targetMin: number;
  targetMax: number;
  remaining: number;
}

function recentHighStrainStreak(history: DailySummary[], day: DailySummary): number {
  const ordered = [day, ...history.filter((d) => d.date !== day.date)].slice(0, 5);
  let streak = 0;
  for (const d of ordered) {
    if (d.strain.current >= d.strain.targetMax * 0.85) streak += 1;
    else break;
  }
  return streak;
}

export function trainingBalance(
  day: DailySummary,
  history: DailySummary[] = [],
  t: Dictionary = en,
): TrainingBalance {
  const { current, targetMin, targetMax, workouts } = day.strain;
  const zone = day.recovery.zone;
  const workoutMin = workouts.reduce((s, w) => s + w.durationMin, 0);
  const remaining = Math.max(0, Math.round(((targetMin + targetMax) / 2 - current) * 10) / 10);
  const streak = recentHighStrainStreak(history, day);

  const base = {
    workoutsToday: workouts.length,
    workoutMin,
    strain: current,
    targetMin,
    targetMax,
    remaining,
  };

  if (zone === "red" && current < targetMin) {
    return {
      ...base,
      status: "recover",
      label: t.trainingBalance.recover,
      detail: t.trainingBalance.recoverDetail
        .replace("{strain}", current.toFixed(1))
        .replace("{target}", `${targetMin}–${targetMax}`),
    };
  }

  if (current > targetMax || (zone === "red" && current >= targetMin) || (zone === "yellow" && current > targetMax * 0.95)) {
    const detail =
      workouts.length > 0
        ? t.trainingBalance.overtrainingDetail
            .replace("{strain}", current.toFixed(1))
            .replace("{target}", `${targetMin}–${targetMax}`)
            .replace("{min}", String(workoutMin))
            .replace("{n}", String(workouts.length))
        : t.trainingBalance.overtrainingNoSession
            .replace("{strain}", current.toFixed(1))
            .replace("{target}", `${targetMin}–${targetMax}`);

    return { ...base, status: "overtraining", label: t.trainingBalance.overtraining, detail };
  }

  if (streak >= 3 && zone !== "green") {
    return {
      ...base,
      status: "overtraining",
      label: t.trainingBalance.overtraining,
      detail: t.trainingBalance.overtrainingStreak.replace("{days}", String(streak)),
    };
  }

  if (zone === "green" && current < targetMin) {
    const detail =
      workouts.length > 0
        ? t.trainingBalance.undertrainingPartial
            .replace("{strain}", current.toFixed(1))
            .replace("{remaining}", remaining.toFixed(1))
            .replace("{min}", String(workoutMin))
        : t.trainingBalance.undertrainingNone
            .replace("{strain}", current.toFixed(1))
            .replace("{remaining}", remaining.toFixed(1))
            .replace("{target}", `${targetMin}–${targetMax}`);

    return { ...base, status: "undertraining", label: t.trainingBalance.undertraining, detail };
  }

  if (current >= targetMin && current <= targetMax) {
    const detail =
      workouts.length > 0
        ? t.trainingBalance.onTrackDetail
            .replace("{strain}", current.toFixed(1))
            .replace("{min}", String(workoutMin))
            .replace("{n}", String(workouts.length))
        : t.trainingBalance.onTrackRestDay
            .replace("{strain}", current.toFixed(1))
            .replace("{target}", `${targetMin}–${targetMax}`);

    return { ...base, status: "on_track", label: t.trainingBalance.onTrack, detail };
  }

  if (zone === "yellow" && current < targetMin) {
    return {
      ...base,
      status: "undertraining",
      label: t.trainingBalance.undertraining,
      detail: t.trainingBalance.undertrainingCautious
        .replace("{strain}", current.toFixed(1))
        .replace("{remaining}", remaining.toFixed(1)),
    };
  }

  return {
    ...base,
    status: "on_track",
    label: t.trainingBalance.onTrack,
    detail: t.trainingBalance.onTrackModerate
      .replace("{strain}", current.toFixed(1))
      .replace("{target}", `${targetMin}–${targetMax}`),
  };
}

export function trainingBalanceForContext(day: DailySummary, history: DailySummary[] = []) {
  const b = trainingBalance(day, history, en);
  return {
    status: b.status,
    strain: b.strain,
    targetMin: b.targetMin,
    targetMax: b.targetMax,
    remaining: b.remaining,
    workoutsToday: b.workoutsToday,
    totalWorkoutMin: b.workoutMin,
    workouts: day.strain.workouts?.map((w) => ({
      name: w.name,
      type: w.type,
      durationMin: w.durationMin,
      strain: w.strain,
      avgHr: w.avgHr,
      distanceKm: w.distanceKm,
    })),
  };
}
