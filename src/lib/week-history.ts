import type { DailySummary } from "./types";

/** Newest-first in sync; charts need oldest → newest (left → right). */
export function weekChronological(history: DailySummary[], days = 7): DailySummary[] {
  return [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
}

export function shortDayLabel(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "short",
  });
}

export function formatHoursMinutes(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
