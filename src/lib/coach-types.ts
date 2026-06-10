export interface CoachMessage {
  headline: string;
  insight: string;
  action: string;
  watchouts?: string[];
}

export interface CoachBundle {
  morning: CoachMessage | string;
  evening?: CoachMessage | string;
  morningRu?: CoachMessage;
  eveningRu?: CoachMessage;
}

export function parseCoachJson(raw: string): CoachMessage {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { headline: trimmed.slice(0, 80), insight: trimmed, action: "" };
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<CoachMessage>;
  const watchouts = Array.isArray(parsed.watchouts)
    ? parsed.watchouts.map((w) => String(w).trim()).filter(Boolean).slice(0, 4)
    : undefined;

  return {
    headline: String(parsed.headline ?? "").trim(),
    insight: String(parsed.insight ?? "").trim(),
    action: String(parsed.action ?? "").trim(),
    watchouts: watchouts?.length ? watchouts : undefined,
  };
}

function isTechnicalCoachText(text: string): boolean {
  return /Recovery \d+%|Target strain|Body Battery|Day strain|Stress avg|Fitness age \d+|HRV \d|RHR \d|debt \d/i.test(
    text
  );
}

export interface CoachFallbacks {
  morning: CoachMessage;
  evening: CoachMessage;
}

function isStructuredCoach(v: unknown): v is CoachMessage {
  return (
    typeof v === "object" &&
    v !== null &&
    "headline" in v &&
    typeof (v as CoachMessage).headline === "string"
  );
}

export function normalizeCoach(
  coach: unknown,
  fallback: CoachMessage | CoachFallbacks,
  options?: { locale?: "en" | "ru" }
): { morning: CoachMessage; evening: CoachMessage } {
  const fallbacks: CoachFallbacks =
    "morning" in fallback && "evening" in fallback
      ? (fallback as CoachFallbacks)
      : { morning: fallback as CoachMessage, evening: fallback as CoachMessage };

  if (typeof coach !== "object" || coach === null || !("morning" in coach)) {
    return fallbacks;
  }

  const c = coach as CoachBundle;

  const morning =
    options?.locale === "ru" && c.morningRu
      ? c.morningRu
      : isStructuredCoach(c.morning)
        ? c.morning
        : typeof c.morning === "string" && c.morning.trim() && !isTechnicalCoachText(c.morning)
          ? { headline: fallbacks.morning.headline, insight: c.morning.trim(), action: fallbacks.morning.action }
          : fallbacks.morning;

  const evening =
    options?.locale === "ru" && c.eveningRu
      ? c.eveningRu
      : isStructuredCoach(c.evening)
        ? c.evening!
        : typeof c.evening === "string" && c.evening.trim() && !isTechnicalCoachText(c.evening)
          ? { headline: fallbacks.evening.headline, insight: c.evening.trim(), action: fallbacks.evening.action }
          : fallbacks.evening;

  return { morning, evening };
}
