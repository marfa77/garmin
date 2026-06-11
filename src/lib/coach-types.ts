export interface CoachMessage {
  headline: string;
  insight: string;
  action: string;
  /** How the body has shifted over recent days */
  dynamics?: string;
  /** Warm acknowledgment of progress */
  progress?: string;
  watchouts?: string[];
}

export type CoachPersona = "caring" | "sarcastic";

export interface CoachBundle {
  morning: CoachMessage | string;
  evening?: CoachMessage | string;
  morningRu?: CoachMessage;
  eveningRu?: CoachMessage;
  morningSarcastic?: CoachMessage;
  morningSarcasticRu?: CoachMessage;
  eveningSarcastic?: CoachMessage;
  eveningSarcasticRu?: CoachMessage;
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
    dynamics: String(parsed.dynamics ?? "").trim() || undefined,
    progress: String(parsed.progress ?? "").trim() || undefined,
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

function pickCoachMessage(
  primary: CoachMessage | string | undefined,
  primaryRu: CoachMessage | undefined,
  fallback: CoachMessage,
  locale?: "en" | "ru"
): CoachMessage {
  if (locale === "ru" && primaryRu) return primaryRu;
  if (isStructuredCoach(primary)) return primary;
  if (typeof primary === "string" && primary.trim() && !isTechnicalCoachText(primary)) {
    return { headline: fallback.headline, insight: primary.trim(), action: fallback.action };
  }
  return fallback;
}

export function normalizeCoach(
  coach: unknown,
  fallback: CoachMessage | CoachFallbacks,
  options?: { locale?: "en" | "ru"; persona?: CoachPersona }
): { morning: CoachMessage; evening: CoachMessage } {
  const caringFallbacks: CoachFallbacks =
    "morning" in fallback && "evening" in fallback
      ? (fallback as CoachFallbacks)
      : { morning: fallback as CoachMessage, evening: fallback as CoachMessage };

  const sarcasticFallbacks: CoachFallbacks =
    "morning" in fallback && "evening" in fallback && "sarcasticMorning" in fallback
      ? {
          morning: (fallback as CoachFallbacks & { sarcasticMorning: CoachMessage; sarcasticEvening: CoachMessage })
            .sarcasticMorning,
          evening: (fallback as CoachFallbacks & { sarcasticMorning: CoachMessage; sarcasticEvening: CoachMessage })
            .sarcasticEvening,
        }
      : caringFallbacks;

  const fallbacks = options?.persona === "sarcastic" ? sarcasticFallbacks : caringFallbacks;

  if (typeof coach !== "object" || coach === null || !("morning" in coach)) {
    return fallbacks;
  }

  const c = coach as CoachBundle;
  const persona = options?.persona ?? "caring";

  if (persona === "sarcastic") {
    return {
      morning: pickCoachMessage(c.morningSarcastic, c.morningSarcasticRu, fallbacks.morning, options?.locale),
      evening: pickCoachMessage(c.eveningSarcastic, c.eveningSarcasticRu, fallbacks.evening, options?.locale),
    };
  }

  return {
    morning: pickCoachMessage(c.morning, c.morningRu, fallbacks.morning, options?.locale),
    evening: pickCoachMessage(c.evening, c.eveningRu, fallbacks.evening, options?.locale),
  };
}
