import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import type { DailySummary } from "./types";

export interface ContributorBar {
  id: string;
  label: string;
  pct: number;
  status: "optimal" | "good" | "sufficient" | "pay_attention";
  hint: string;
}

export function recoveryContributorBars(day: DailySummary, t: Dictionary = en): ContributorBar[] {
  const { sleep, vitals, strain } = day;
  const hrvDelta = vitals.hrv - vitals.hrvBaseline;
  const hrvPct = Math.min(100, Math.max(0, 50 + hrvDelta * 2));
  const rhrDelta = vitals.rhr - vitals.rhrBaseline;
  const rhrPct = Math.min(100, Math.max(0, 100 - rhrDelta * 12));
  const sleepPct = sleep.score;
  const loadPct = Math.max(0, 100 - Math.max(0, strain.current - 14) * 8);
  const bbPct = vitals.bodyBatteryNow;
  const stressPct = Math.max(0, 100 - vitals.stressAvg * 0.9);

  const status = (pct: number): ContributorBar["status"] =>
    pct >= 85 ? "optimal" : pct >= 70 ? "good" : pct >= 55 ? "sufficient" : "pay_attention";

  return [
    {
      id: "hrv",
      label: t.contributors.hrv,
      pct: Math.round(hrvPct),
      status: status(hrvPct),
      hint: hrvDelta >= 0 ? t.contributors.hrvAbove : t.contributors.hrvBelow,
    },
    {
      id: "rhr",
      label: t.contributors.rhr,
      pct: Math.round(rhrPct),
      status: status(rhrPct),
      hint: rhrDelta <= 0 ? t.contributors.rhrCalm : t.contributors.rhrUp,
    },
    {
      id: "sleep",
      label: t.contributors.sleep,
      pct: sleepPct,
      status: status(sleepPct),
      hint: sleepPct >= 85 ? t.contributors.sleepStrong : t.contributors.sleepImprove,
    },
    {
      id: "strain",
      label: t.contributors.strain,
      pct: Math.round(loadPct),
      status: status(loadPct),
      hint: strain.current <= strain.targetMax ? t.contributors.strainInRange : t.contributors.strainHot,
    },
    {
      id: "battery",
      label: t.contributors.battery,
      pct: bbPct,
      status: status(bbPct),
      hint: bbPct >= 50 ? t.contributors.bbGood : t.contributors.bbLow,
    },
    {
      id: "stress",
      label: t.contributors.stress,
      pct: Math.round(stressPct),
      status: status(stressPct),
      hint: vitals.stressAvg <= 30 ? t.contributors.stressLow : t.contributors.stressHigh,
    },
  ];
}
