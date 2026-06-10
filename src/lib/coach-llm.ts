import { parseCoachJson, type CoachMessage } from "./coach-types";
import type { DailySummary, DashboardData } from "./types";
import { callOpenRouter } from "./openrouter";

const SYSTEM_PROMPT = `You write copy for a WHOOP-style recovery app. Sound like a calm, confident human coach — NOT a data report.

VOICE RULES:
- Lead with meaning, not metrics.
- NEVER list multiple numbers (max ONE if needed).
- NEVER say "target strain", "baseline", or metric abbreviations.
- headline: 4-8 words, punchy, no numbers.
- insight: 1-2 sentences, minimal numbers.
- action: 1 sentence, concrete behavior.

Return ONLY valid JSON: {"headline":"...","insight":"...","action":"..."}`;

function coachBrief(day: DailySummary) {
  return {
    recoveryZone: day.recovery.zone,
    recoveryScore: day.recovery.score,
    strainSoFar: day.strain.current,
    bodyBatteryLow: day.vitals.bodyBatteryNow < 35,
    sleepQuality: day.sleep.score < 70 ? "weak" : day.sleep.score >= 85 ? "strong" : "okay",
    hadWorkout: day.strain.workouts.length > 0,
  };
}

async function generateCoach(userPrompt: string): Promise<CoachMessage> {
  const raw = await callOpenRouter(SYSTEM_PROMPT, userPrompt);
  return parseCoachJson(raw);
}

export async function enrichDashboardWithLLM(data: DashboardData): Promise<DashboardData> {
  const brief = coachBrief(data.today);
  const [morning, evening, weekly] = await Promise.all([
    generateCoach(`MORNING guidance. Context:\n${JSON.stringify(brief)}`),
    generateCoach(`EVENING guidance. Context:\n${JSON.stringify(brief)}`),
    callOpenRouter(
      SYSTEM_PROMPT,
      `WEEKLY story, 2-3 sentences, no stat dumps. greenDays: ${data.weekly.greenDays}. Plain text only.`
    ),
  ]);

  return {
    ...data,
    today: { ...data.today, coach: { morning, evening } },
    weekly: { ...data.weekly, narrative: weekly },
    coachMeta: {
      provider: "openrouter",
      model: process.env.OPENROUTER_COACH_MODEL || "google/gemini-2.5-flash",
      generatedAt: new Date().toISOString(),
    },
  };
}
