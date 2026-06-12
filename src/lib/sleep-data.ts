import type { DailySummary } from "./types";

export function hasSleepData(day: DailySummary): boolean {
  const stageMin = day.sleep.deepMin + day.sleep.remMin + day.sleep.lightMin + day.sleep.awakeMin;
  return day.sleep.hours > 0 || stageMin > 0 || (day.sleep.hypnogram?.length ?? 0) > 0;
}

/** Most recent night with real Garmin sleep, when today is still empty. */
export function latestSleepNight(history: DailySummary[]): DailySummary | null {
  for (const day of history) {
    if (hasSleepData(day)) return day;
  }
  return null;
}
