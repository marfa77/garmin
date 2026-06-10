import type { ContributorBar } from "./contributors";
import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import {
  sleepEfficiency,
  sleepHoursVsNeeded,
  type Status,
} from "./interpretations";
import type { DailySummary } from "./types";
import { formatHoursMinutes } from "./week-history";

export interface SleepTypicalRange {
  deep: { min: number; max: number };
  rem: { min: number; max: number };
  light: { min: number; max: number };
  awake: { min: number; max: number };
}

export function sleepConsistencyScore(day: DailySummary, history: DailySummary[] = []) {
  const recent = history.slice(0, 7);
  if (recent.length >= 3) {
    const scores = recent.map((d) => d.sleep.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const spread = scores.reduce((s, v) => s + Math.abs(v - avg), 0) / scores.length;
    const pct = Math.round(Math.max(35, Math.min(100, 100 - spread * 1.8)));
    const status: Status = pct >= 80 ? "optimal" : pct >= 65 ? "sufficient" : pct >= 50 ? "pay_attention" : "poor";
    return { pct, status };
  }
  const fromScore = Math.min(100, day.sleep.score + 8);
  const fromDebt = Math.max(30, Math.min(100, 100 - day.sleep.debt7d * 4));
  const pct = Math.round((fromScore + fromDebt) / 2);
  const status: Status = pct >= 80 ? "optimal" : pct >= 65 ? "sufficient" : "pay_attention";
  return { pct, status };
}

export function sleepStressScore(day: DailySummary) {
  const highStressPct = Math.min(100, Math.round(day.vitals.stressAvg * 0.85));
  const qualityPct = Math.max(0, 100 - highStressPct);
  const status: Status =
    highStressPct <= 10 ? "optimal" : highStressPct <= 25 ? "good" : highStressPct <= 40 ? "sufficient" : "pay_attention";
  return { highStressPct, qualityPct, status };
}

export function sleepContributorBars(day: DailySummary, history: DailySummary[] = [], t: Dictionary = en): ContributorBar[] {
  const hvn = sleepHoursVsNeeded(day);
  const eff = sleepEfficiency(day);
  const con = sleepConsistencyScore(day, history);
  const stress = sleepStressScore(day);

  return [
    {
      id: "hours",
      label: t.sleep.hoursVsNeeded,
      pct: hvn.pct,
      status: hvn.status === "poor" ? "pay_attention" : hvn.status === "optimal" ? "optimal" : hvn.status === "sufficient" ? "sufficient" : "pay_attention",
      hint: hvn.label,
    },
    {
      id: "consistency",
      label: t.sleep.consistency,
      pct: con.pct,
      status: con.status === "optimal" ? "optimal" : con.status === "sufficient" ? "sufficient" : "pay_attention",
      hint: `${con.pct}%`,
    },
    {
      id: "efficiency",
      label: t.sleep.efficiency,
      pct: eff.pct,
      status: eff.status === "optimal" ? "optimal" : eff.status === "good" ? "good" : "sufficient",
      hint: `${eff.pct}%`,
    },
    {
      id: "sleep_stress",
      label: t.sleep.sleepStress,
      pct: stress.qualityPct,
      status: stress.status === "optimal" ? "optimal" : stress.status === "good" ? "good" : "sufficient",
      hint: `${stress.highStressPct}%`,
    },
  ];
}

export function restorativeSleep(day: DailySummary) {
  const min = day.sleep.deepMin + day.sleep.remMin;
  return { minutes: min, label: formatHoursMinutes(min) };
}

export function sleepTypicalRanges(history: DailySummary[]): SleepTypicalRange {
  const days = history.slice(0, 14).filter((d) => d.sleep.hours > 0);
  if (!days.length) {
    return {
      deep: { min: 15, max: 25 },
      rem: { min: 18, max: 28 },
      light: { min: 45, max: 60 },
      awake: { min: 2, max: 8 },
    };
  }

  const pcts = days.map((d) => {
    const total = d.sleep.deepMin + d.sleep.remMin + d.sleep.lightMin + d.sleep.awakeMin || 1;
    return {
      deep: (d.sleep.deepMin / total) * 100,
      rem: (d.sleep.remMin / total) * 100,
      light: (d.sleep.lightMin / total) * 100,
      awake: (d.sleep.awakeMin / total) * 100,
    };
  });

  const avg = (key: keyof (typeof pcts)[0]) => pcts.reduce((s, p) => s + p[key], 0) / pcts.length;
  const pad = (v: number) => ({ min: Math.max(0, Math.round(v - 6)), max: Math.min(100, Math.round(v + 6)) });

  return {
    deep: pad(avg("deep")),
    rem: pad(avg("rem")),
    light: pad(avg("light")),
    awake: pad(avg("awake")),
  };
}

export function sleepPerformanceInsight(day: DailySummary, bars: ContributorBar[], t: Dictionary = en): string {
  const weakest = [...bars].sort((a, b) => a.pct - b.pct)[0];
  const map: Record<string, string> = {
    hours: t.sleep.insightHours,
    consistency: t.sleep.insightConsistency,
    efficiency: t.sleep.insightEfficiency,
    sleep_stress: t.sleep.insightStress,
  };
  const focus = map[weakest.id] ?? t.sleep.insightDefault;
  const base =
    day.sleep.score >= 80 ? t.sleep.insightGood : day.sleep.score >= 65 ? t.sleep.insightOk : t.sleep.insightWeak;
  return `${base} ${focus}`;
}
