import type { Dictionary } from "./i18n/types";
import { en } from "./i18n/en";
import { sleepConsistencyScore } from "./sleep-contributors";
import type { DailySummary, DashboardData, RecoveryDriver } from "./types";

export type Trend = "up" | "down" | "neutral";
export type Status = "optimal" | "good" | "sufficient" | "pay_attention" | "poor";

export function trendFromDelta(delta: number, invert = false): Trend {
  const d = invert ? -delta : delta;
  if (d > 2) return "up";
  if (d < -2) return "down";
  return "neutral";
}

export function sleepHoursVsNeeded(day: DailySummary) {
  const ratio = Math.min(1, day.sleep.hours / day.sleep.need);
  const pct = Math.round(ratio * 100);
  const status: Status = pct >= 95 ? "optimal" : pct >= 80 ? "sufficient" : pct >= 65 ? "pay_attention" : "poor";
  return { pct, ratio, label: `${day.sleep.hours.toFixed(1)}h / ${day.sleep.need.toFixed(1)}h`, status };
}

export function sleepEfficiency(day: DailySummary) {
  const total = day.sleep.deepMin + day.sleep.remMin + day.sleep.lightMin + day.sleep.awakeMin;
  const asleep = total - day.sleep.awakeMin;
  const pct = total > 0 ? Math.round((asleep / total) * 100) : 0;
  const status: Status = pct >= 90 ? "optimal" : pct >= 82 ? "good" : pct >= 72 ? "sufficient" : "pay_attention";
  return { pct, status };
}

export function sleepConsistency(day: DailySummary, history: DailySummary[] = []) {
  return sleepConsistencyScore(day, history);
}

export function strainLevel(strain: number, t: Dictionary = en) {
  if (strain < 8) return { label: t.strain.light, description: t.strain.lightDesc };
  if (strain < 14) return { label: t.strain.moderate, description: t.strain.moderateDesc };
  if (strain < 18) return { label: t.strain.strenuous, description: t.strain.strenuousDesc };
  return { label: t.strain.allOut, description: t.strain.allOutDesc };
}

export function recoveryMetrics(day: DailySummary, t: Dictionary = en) {
  const hrvDelta = day.vitals.hrv - day.vitals.hrvBaseline;
  const rhrDelta = day.vitals.rhr - day.vitals.rhrBaseline;
  return [
    {
      id: "hrv",
      label: t.contributors.hrv,
      value: `${day.vitals.hrv}`,
      unit: "ms",
      trend: trendFromDelta(hrvDelta),
      status: (hrvDelta >= 0 ? "optimal" : hrvDelta >= -5 ? "sufficient" : "pay_attention") as Status,
      hint:
        hrvDelta >= 5 ? t.metrics.hrvAbove : hrvDelta >= 0 ? t.metrics.hrvNear : t.metrics.hrvBelow,
    },
    {
      id: "rhr",
      label: t.overview.restingHr,
      value: `${day.vitals.rhr}`,
      unit: "bpm",
      trend: trendFromDelta(rhrDelta, true),
      status: (rhrDelta <= 0 ? "good" : rhrDelta <= 3 ? "sufficient" : "pay_attention") as Status,
      hint: rhrDelta <= 0 ? t.metrics.rhrLow : rhrDelta <= 3 ? t.metrics.rhrSlight : t.metrics.rhrHigh,
    },
    {
      id: "sleep_perf",
      label: t.rings.sleepPerformance,
      value: `${day.sleep.score}`,
      unit: "%",
      trend: (day.sleep.score >= 80 ? "up" : day.sleep.score >= 65 ? "neutral" : "down") as Trend,
      status: (day.sleep.score >= 85 ? "optimal" : day.sleep.score >= 70 ? "sufficient" : "pay_attention") as Status,
      hint:
        day.sleep.score >= 85 ? t.metrics.sleepStrong : day.sleep.score >= 70 ? t.metrics.sleepOk : t.metrics.sleepWeak,
    },
    {
      id: "body_battery",
      label: t.contributors.battery,
      value: `${day.vitals.bodyBatteryNow}`,
      unit: "",
      trend: (day.vitals.bodyBatteryNow >= 50 ? "up" : day.vitals.bodyBatteryNow >= 30 ? "neutral" : "down") as Trend,
      status: (day.vitals.bodyBatteryNow >= 50 ? "good" : day.vitals.bodyBatteryNow >= 25 ? "sufficient" : "pay_attention") as Status,
      hint:
        day.vitals.bodyBatteryNow >= 50 ? t.metrics.bbHigh : day.vitals.bodyBatteryNow >= 25 ? t.metrics.bbMid : t.metrics.bbLow,
    },
  ];
}

export function sleepDetailMetrics(day: DailySummary, t: Dictionary = en) {
  const hvn = sleepHoursVsNeeded(day);
  const eff = sleepEfficiency(day);
  const con = sleepConsistency(day);
  return [
    { id: "hours", label: t.sleep.hoursVsNeeded, value: hvn.label, pct: hvn.pct, status: hvn.status },
    { id: "consistency", label: t.sleep.consistency, value: `${con.pct}%`, pct: con.pct, status: con.status },
    { id: "efficiency", label: t.sleep.efficiency, value: `${eff.pct}%`, pct: eff.pct, status: eff.status },
    {
      id: "debt",
      label: t.sleep.debt7d,
      value: `${day.sleep.debt7d.toFixed(1)}h`,
      pct: Math.max(0, 100 - day.sleep.debt7d * 10),
      status: (day.sleep.debt7d < 3 ? "good" : day.sleep.debt7d < 7 ? "sufficient" : "pay_attention") as Status,
    },
  ];
}

export function keyStatistics(day: DailySummary, t: Dictionary = en) {
  const phys = Math.min(100, day.recovery.score + (day.vitals.hrv >= day.vitals.hrvBaseline ? 5 : -5));
  const mental = Math.max(0, Math.min(100, day.recovery.score - (day.vitals.stressAvg > 40 ? 20 : day.vitals.stressAvg > 25 ? 10 : 0)));
  return [
    {
      id: "physical",
      label: t.overview.physicalRecovery,
      value: phys,
      status: (phys >= 80 ? "optimal" : phys >= 60 ? "sufficient" : "pay_attention") as Status,
      hint: phys >= 80 ? t.metrics.physHigh : phys >= 60 ? t.metrics.physMid : t.metrics.physLow,
    },
    {
      id: "mental",
      label: t.overview.mentalRecovery,
      value: mental,
      status: (mental >= 70 ? "good" : mental >= 50 ? "sufficient" : "pay_attention") as Status,
      hint: mental >= 70 ? t.metrics.mentalHigh : mental >= 50 ? t.metrics.mentalMid : t.metrics.mentalLow,
    },
    {
      id: "rhr",
      label: t.overview.restingHr,
      value: day.vitals.rhr,
      status: (day.vitals.rhr <= day.vitals.rhrBaseline ? "good" : "sufficient") as Status,
      hint: day.vitals.rhr <= day.vitals.rhrBaseline ? t.metrics.rhrCalm : t.metrics.rhrWatch,
    },
  ];
}

export function heartHealthStatus(day: DailySummary, t: Dictionary = en) {
  const ok = day.vitals.rhr <= day.vitals.rhrBaseline + 2 && day.vitals.hrv >= day.vitals.hrvBaseline * 0.9;
  if (ok) {
    return { label: t.heart.withinRange, status: "optimal" as Status, insight: t.heart.okInsight };
  }
  if (day.vitals.rhr > day.vitals.rhrBaseline + 2) {
    return { label: t.heart.monitor, status: "pay_attention" as Status, insight: t.heart.rhrHighInsight };
  }
  return { label: t.heart.monitor, status: "pay_attention" as Status, insight: t.heart.hrvLowInsight };
}

export function driverInterpretation(driver: RecoveryDriver, t: Dictionary = en): string {
  if (driver.factor === "hrv") {
    if (driver.impact === "positive") return t.drivers.hrvPos;
    if (driver.impact === "high") return t.drivers.hrvHigh;
    return t.drivers.hrvMid;
  }
  if (driver.factor === "rhr") {
    if (driver.impact === "positive") return t.drivers.rhrPos;
    if (driver.impact === "high") return t.drivers.rhrHigh;
    return t.drivers.rhrMid;
  }
  if (driver.factor === "sleep") {
    if (driver.impact === "positive") return t.drivers.sleepPos;
    if (driver.impact === "high") return t.drivers.sleepHigh;
    return t.drivers.sleepMid;
  }
  if (driver.factor === "load") {
    const load = typeof driver.value === "number" ? driver.value : parseFloat(String(driver.value));
    if (driver.impact === "high" || load > 16) return t.drivers.loadHigh;
    if (driver.impact === "positive" || load < 10) return t.drivers.loadPos;
    return t.drivers.loadMid;
  }
  return t.drivers.default;
}

export function sleepStageInsight(day: DailySummary, t: Dictionary = en): string {
  const { deepMin, remMin, hours, need } = day.sleep;
  const deepPct = hours > 0 ? (deepMin / 60 / hours) * 100 : 0;
  const remPct = hours > 0 ? (remMin / 60 / hours) * 100 : 0;
  const gap = need - hours;

  if (gap > 1.5) {
    return t.coach.sleep.debt
      .replace("{hours}", hours.toFixed(1))
      .replace("{need}", need.toFixed(1));
  }
  if (deepPct < 12) return t.coach.sleep.deepLow;
  if (remPct < 15) return t.coach.sleep.remLow;
  if (day.sleep.score >= 85) return t.coach.sleep.solid;
  return t.coach.sleep.ok;
}

export function strainRecommendation(day: DailySummary, t: Dictionary = en) {
  const { current, targetMin, targetMax } = day.strain;
  const mid = (targetMin + targetMax) / 2;
  const remaining = Math.max(0, mid - current);
  const level = strainLevel(current, t);

  if (day.recovery.zone === "green" && current < targetMin) {
    return {
      headline: t.coach.strain.build.headline,
      insight: t.coach.strain.build.insight.replace("{level}", level.label.toLowerCase()),
      action: remaining > 3 ? t.coach.strain.build.actionHard : t.coach.strain.build.actionLight,
    };
  }
  if (current > targetMax) {
    return {
      headline: t.coach.strain.ease.headline,
      insight: t.coach.strain.ease.insight,
      action: t.coach.strain.ease.action,
    };
  }
  if (current >= targetMin && current <= targetMax) {
    return {
      headline: t.coach.strain.matched.headline,
      insight: t.coach.strain.matched.insight,
      action: t.coach.strain.matched.action,
    };
  }
  return {
    headline: level.label,
    insight: level.description,
    action: day.recovery.zone === "red" ? t.coach.strain.gentle : t.coach.strain.lightAerobic,
  };
}

export function weeklyNarrativeFallback(weekly: DashboardData["weekly"], t: Dictionary = en): string {
  if (weekly.greenDays >= 5) return t.coach.week.strong;
  if (weekly.greenDays >= 3) return t.coach.week.mixed;
  return t.coach.week.tough;
}

export function resolveWeeklyNarrative(weekly: DashboardData["weekly"], t: Dictionary = en): string {
  const raw = typeof weekly.narrative === "string" ? weekly.narrative.trim() : "";
  if (!raw || /green recovery days|Avg recovery|balance\)/i.test(raw)) {
    return weeklyNarrativeFallback(weekly, t);
  }
  return raw;
}

export function strainRemaining(day: DailySummary): number {
  const mid = (day.strain.targetMin + day.strain.targetMax) / 2;
  return Math.max(0, Math.round((mid - day.strain.current) * 10) / 10);
}
