import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import type { DailySummary, RecoveryZone } from "./types";

export interface HeroInsight {
  id: string;
  title: string;
  body: string;
  zone: RecoveryZone;
  badge?: string;
}

function pctDelta(current: number, baseline: number): number {
  if (!baseline) return 0;
  return Math.round(((current - baseline) / baseline) * 100);
}

export function heroInsights(day: DailySummary, t: Dictionary = en): HeroInsight[] {
  const { vitals } = day;
  const hrvPct = pctDelta(vitals.hrv, vitals.hrvBaseline);
  const rhrPct = pctDelta(vitals.rhr, vitals.rhrBaseline);
  const items: HeroInsight[] = [];

  if (hrvPct >= 3) {
    items.push({
      id: "hrv-up",
      title: t.hero.hrvUpTitle,
      body: t.hero.hrvUpBody.replace("{pct}", String(Math.abs(hrvPct))),
      zone: "green",
      badge: t.hero.withinRange,
    });
  } else if (hrvPct <= -5) {
    items.push({
      id: "hrv-down",
      title: t.hero.hrvDownTitle,
      body: t.hero.hrvDownBody.replace("{pct}", String(Math.abs(hrvPct))),
      zone: "yellow",
    });
  }

  if (rhrPct <= -3) {
    items.push({
      id: "rhr-down",
      title: t.hero.rhrDownTitle,
      body: t.hero.rhrDownBody.replace("{pct}", String(Math.abs(rhrPct))),
      zone: "green",
      badge: t.hero.withinRange,
    });
  } else if (rhrPct >= 5) {
    items.push({
      id: "rhr-up",
      title: t.hero.rhrUpTitle,
      body: t.hero.rhrUpBody.replace("{pct}", String(Math.abs(rhrPct))),
      zone: "yellow",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "steady",
      title: t.hero.steadyTitle,
      body: t.hero.steadyBody,
      zone: day.recovery.zone,
      badge: day.recovery.zone === "green" ? t.hero.withinRange : undefined,
    });
  }

  return items.slice(0, 2);
}
