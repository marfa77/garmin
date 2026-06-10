import type { DailySummary, RecoveryDriver, RecoveryZone } from "./types";

export function recoveryZone(score: number): RecoveryZone {
  if (score >= 67) return "green";
  if (score >= 34) return "yellow";
  return "red";
}

export function targetStrain(recoveryScore: number): { min: number; max: number } {
  if (recoveryScore >= 67) return { min: 14, max: 18 };
  if (recoveryScore >= 34) return { min: 10, max: 14 };
  return { min: 4, max: 8 };
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function hrvComponent(hrv: number, baseline: number): number {
  if (!baseline) return 50;
  const ratio = hrv / baseline;
  return clamp(Math.round(ratio * 100));
}

export function rhrComponent(rhr: number, baseline: number): number {
  if (!baseline) return 50;
  const delta = rhr - baseline;
  return clamp(Math.round(100 - delta * 8));
}

export function computeRecovery(input: {
  hrv: number;
  hrvBaseline: number;
  rhr: number;
  rhrBaseline: number;
  sleepScore: number;
  priorStrain: number;
  bodyBatteryMorning?: number;
}): { score: number; zone: RecoveryZone; drivers: RecoveryDriver[] } {
  const hrvScore = hrvComponent(input.hrv, input.hrvBaseline);
  const rhrScore = rhrComponent(input.rhr, input.rhrBaseline);
  const sleepScore = clamp(input.sleepScore);
  const loadPenalty = clamp(100 - Math.max(0, input.priorStrain - 12) * 6);

  let score = Math.round(
    0.35 * hrvScore + 0.25 * rhrScore + 0.3 * sleepScore + 0.1 * loadPenalty
  );

  if (input.bodyBatteryMorning !== undefined && input.bodyBatteryMorning < 30) {
    score = Math.max(0, score - 8);
  }

  score = clamp(score);
  const zone = recoveryZone(score);

  const hrvDelta = input.hrvBaseline
    ? Math.round(((input.hrv - input.hrvBaseline) / input.hrvBaseline) * 100)
    : 0;
  const rhrDelta = input.rhr - input.rhrBaseline;

  const drivers: RecoveryDriver[] = [
    {
      factor: "hrv",
      label: "HRV",
      value: input.hrv,
      baseline: input.hrvBaseline,
      delta: `${hrvDelta >= 0 ? "+" : ""}${hrvDelta}%`,
      impact: hrvDelta < -10 ? "high" : hrvDelta > 5 ? "positive" : "medium",
    },
    {
      factor: "rhr",
      label: "Resting HR",
      value: input.rhr,
      baseline: input.rhrBaseline,
      delta: `${rhrDelta >= 0 ? "+" : ""}${rhrDelta} bpm`,
      impact: rhrDelta > 3 ? "high" : rhrDelta < 0 ? "positive" : "low",
    },
    {
      factor: "sleep",
      label: "Sleep",
      value: `${input.sleepScore}%`,
      impact: input.sleepScore < 70 ? "high" : input.sleepScore >= 85 ? "positive" : "medium",
    },
    {
      factor: "load",
      label: "Prior strain",
      value: input.priorStrain.toFixed(1),
      impact: input.priorStrain > 16 ? "high" : input.priorStrain < 10 ? "positive" : "medium",
    },
  ];

  drivers.sort((a, b) => {
    const weight = { high: 0, medium: 1, low: 2, positive: 3 };
    return weight[a.impact] - weight[b.impact];
  });

  return { score, zone, drivers };
}

export function estimateStrainFromLoad(trainingLoad: number): number {
  return Math.min(21, Math.round((trainingLoad / 180) * 21 * 10) / 10);
}

export function buildCoachMessage(day: DailySummary, kind: "morning" | "evening"): string {
  const { recovery, strain, sleep, vitals } = day;
  const zoneLabel =
    recovery.zone === "green" ? "high readiness" : recovery.zone === "yellow" ? "moderate readiness" : "low readiness";

  if (kind === "morning") {
    const top = recovery.drivers.filter((d) => d.impact === "high").slice(0, 2);
    const factors =
      top.length > 0
        ? ` Key factors: ${top.map((d) => `${d.label} (${d.delta ?? d.value})`).join(", ")}.`
        : "";
    return `Recovery ${recovery.score}% — ${zoneLabel}.${factors} Target strain ${strain.targetMin}–${strain.targetMax}. Body Battery started at ${vitals.bodyBatteryMax}. Fitness age ${vitals.fitnessAge}.`;
  }

  const inRange = strain.current >= strain.targetMin && strain.current <= strain.targetMax;
  return `Day strain ${strain.current.toFixed(1)}${inRange ? " — within target" : strain.current > strain.targetMax ? " — above target, prioritize rest" : " — light day"}. Sleep need tonight: ${sleep.need.toFixed(1)}h (debt ${sleep.debt7d.toFixed(1)}h). Stress avg ${vitals.stressAvg}.`;
}

export function weeklyStats(history: DailySummary[]) {
  const last7 = history.slice(0, 7);
  const avgRecovery = Math.round(last7.reduce((s, d) => s + d.recovery.score, 0) / last7.length);
  const avgStrain = Math.round((last7.reduce((s, d) => s + d.strain.current, 0) / last7.length) * 10) / 10;
  const avgSleep = Math.round(last7.reduce((s, d) => s + d.sleep.score, 0) / last7.length);
  const greenDays = last7.filter((d) => d.recovery.zone === "green").length;
  const balanced = last7.filter(
    (d) => d.strain.current >= d.strain.targetMin && d.strain.current <= d.strain.targetMax
  ).length;
  const balanceScore = Math.round((balanced / last7.length) * 100);

  return {
    avgRecovery,
    avgStrain,
    avgSleep,
    greenDays,
    balanceScore,
    narrative: `${greenDays}/7 green recovery days. Strain matched recovery ${balanced}/7 days (${balanceScore}% balance). Avg recovery ${avgRecovery}%, strain ${avgStrain}, sleep ${avgSleep}%.`,
  };
}
