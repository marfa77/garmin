import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import type { CoachMessage } from "./coach-types";
import type { DailySummary, RecoveryZone } from "./types";

export function zoneLabel(zone: RecoveryZone, t: Dictionary = en): string {
  return t.zones[zone];
}

function fallbackWatchouts(day: DailySummary, t: Dictionary): string[] {
  const items: string[] = [];
  const { vitals, sleep, strain } = day;

  if (sleep.debt7d >= 3) {
    items.push(t.coachFallback.watchoutSleepDebt.replace("{h}", sleep.debt7d.toFixed(1)));
  }
  if (vitals.bodyBatteryNow < 35) {
    items.push(t.coachFallback.watchoutLowBattery);
  }
  if (vitals.stressAvg > 40) {
    items.push(t.coachFallback.watchoutStress);
  }
  if (vitals.hrv < vitals.hrvBaseline * 0.9) {
    items.push(t.coachFallback.watchoutHrv);
  }
  if (strain.current > strain.targetMax) {
    items.push(t.coachFallback.watchoutStrainHigh);
  }
  if (day.recovery.zone === "green" && strain.current < strain.targetMin) {
    items.push(t.coachFallback.watchoutUndertraining);
  }
  if (sleep.score < 70) {
    items.push(t.coachFallback.watchoutSleepWeak);
  }

  return items.slice(0, 3);
}

export function fallbackCoach(day: DailySummary, period: "morning" | "evening", t: Dictionary = en): CoachMessage {
  const z = day.recovery.zone;
  const watchouts = period === "morning" ? fallbackWatchouts(day, t) : undefined;

  if (period === "morning") {
    const c = t.coach.morning[z];
    return {
      headline: c.headline,
      insight: c.insight,
      action: c.action,
      watchouts: watchouts?.length ? watchouts : undefined,
    };
  }

  const gap = Math.max(0, day.sleep.need - day.sleep.hours).toFixed(1);
  const key =
    day.strain.current > day.strain.targetMax ? "over" : day.vitals.bodyBatteryNow < 30 ? "lowBb" : "good";
  const e = t.coach.evening[key];
  return {
    headline: e.headline,
    insight: e.insight,
    action: e.action.replace("{gap}", gap),
  };
}

function sarcasticFallbackCoach(
  day: DailySummary,
  period: "morning" | "evening",
  t: Dictionary = en
): CoachMessage {
  const z = day.recovery.zone;
  const watchouts = period === "morning" ? fallbackWatchouts(day, t) : undefined;

  if (period === "morning") {
    const c = t.coach.sarcastic.morning[z];
    return {
      headline: c.headline,
      insight: c.insight,
      action: c.action,
      watchouts: watchouts?.length ? watchouts : undefined,
    };
  }

  const gap = Math.max(0, day.sleep.need - day.sleep.hours).toFixed(1);
  const key =
    day.strain.current > day.strain.targetMax ? "over" : day.vitals.bodyBatteryNow < 30 ? "lowBb" : "good";
  const e = t.coach.sarcastic.evening[key];
  return {
    headline: e.headline,
    insight: e.insight,
    action: e.action.replace("{gap}", gap),
  };
}

export function coachFallbacks(day: DailySummary, t: Dictionary = en) {
  return {
    morning: fallbackCoach(day, "morning", t),
    evening: fallbackCoach(day, "evening", t),
    sarcasticMorning: sarcasticFallbackCoach(day, "morning", t),
    sarcasticEvening: sarcasticFallbackCoach(day, "evening", t),
  };
}
