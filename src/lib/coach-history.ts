import { normalizeCoach, type CoachMessage, type CoachPersona } from "./coach-types";
import type { Dictionary } from "./i18n/types";
import { coachFallbacks } from "./whoop-copy";
import type { DailySummary, RecoveryZone } from "./types";

export function hasLlmCoach(
  coach: DailySummary["coach"],
  persona: CoachPersona = "caring"
): boolean {
  const m = persona === "sarcastic" ? coach?.morningSarcastic : coach?.morning;
  return typeof m === "object" && m !== null && Boolean(m.headline?.trim() && m.insight?.trim());
}

export function resolveDayCoach(
  day: DailySummary,
  t: Dictionary,
  locale: "en" | "ru",
  persona: CoachPersona = "caring"
): CoachMessage {
  const { morning } = normalizeCoach(day.coach, coachFallbacks(day, t), { locale, persona });
  return morning;
}

export function coachTimelineDays(history: DailySummary[], days = 7): DailySummary[] {
  return [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days);
}

const zoneAccent: Record<RecoveryZone, string> = {
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  yellow: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  red: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};

export function recoveryZoneClass(zone: RecoveryZone): string {
  return zoneAccent[zone];
}
