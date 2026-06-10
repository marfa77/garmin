import {
  buildCoachMessage,
  computeRecovery,
  estimateStrainFromLoad,
  targetStrain,
  weeklyStats,
} from "./scoring";
import { collectMonthWorkoutsFromHistory } from "./month-workouts";
import type { DailySummary, DashboardData, TimePoint } from "./types";

function makeCurves(seed: number): { bodyBattery: TimePoint[]; stress: TimePoint[] } {
  const bodyBattery: TimePoint[] = [];
  const stress: TimePoint[] = [];
  let bb = 75 + (seed % 15);
  let st = 22 + (seed % 10);

  for (let h = 6; h <= 22; h += 2) {
    if (h < 8) bb = Math.min(100, bb + 12);
    else if (h >= 10 && h <= 16) {
      bb = Math.max(15, bb - 8 - (seed % 5));
      st = Math.min(85, st + 12);
    } else if (h >= 18) {
      bb = Math.max(12, bb - 6);
      st = Math.max(18, st - 5);
    }
    bodyBattery.push({ time: `${h.toString().padStart(2, "0")}:00`, value: bb });
    stress.push({ time: `${h.toString().padStart(2, "0")}:00`, value: st });
  }
  return { bodyBattery, stress };
}

function makeDay(date: string, offset: number): DailySummary {
  const hrv = 44 - (offset % 4) + (offset % 3);
  const hrvBaseline = 46;
  const rhr = 52 + (offset % 3);
  const rhrBaseline = 51;
  const sleepScore = 78 - (offset % 5) * 2;
  const priorStrain = 12 + (offset % 6);
  const trainingLoad = 90 + offset * 8;
  const workoutStrain = estimateStrainFromLoad(trainingLoad);
  const steps = 6200 + offset * 420;
  const activeCalories = 280 + offset * 18;
  const workoutCalories = offset % 2 === 0 ? 380 : 0;
  const lifestyleLoad = Math.max(activeCalories - workoutCalories, 0) * 0.28 + Math.max(0, steps - 4000) * 0.005;
  const lifestyleStrain = estimateStrainFromLoad(lifestyleLoad);
  const strain = Math.round(Math.min(21, workoutStrain + lifestyleStrain) * 10) / 10;
  const curves = makeCurves(offset);

  const recovery = computeRecovery({
    hrv,
    hrvBaseline,
    rhr,
    rhrBaseline,
    sleepScore,
    priorStrain,
    bodyBatteryMorning: curves.bodyBattery[0]?.value,
  });
  const targets = targetStrain(recovery.score);

  const day: DailySummary = {
    date,
    recovery,
    strain: {
      current: strain,
      workoutStrain,
      lifestyleStrain,
      targetMin: targets.min,
      targetMax: targets.max,
      dailyActivity: {
        steps,
        stepGoal: 10000,
        activeCalories,
        bmrCalories: 1170,
        totalCalories: activeCalories + 1170,
        distanceKm: Math.round((steps * 0.00075) * 10) / 10,
        moderateIntensityMin: 12 + offset,
        vigorousIntensityMin: offset % 2 === 0 ? 28 : 4,
      },
      workouts:
        offset % 2 === 0
          ? [
              {
                name: "Morning Run",
                type: "running",
                date,
                durationMin: 42,
                strain: workoutStrain,
                avgHr: 142,
                maxHr: 158,
                calories: 380,
                distanceKm: 6.2,
                paceMinPerKm: 6.77,
                startTime: "07:30",
              },
            ]
          : [],
    },
    sleep: {
      score: sleepScore,
      hours: 6.8 + (offset % 3) * 0.3,
      need: 7.5,
      debt7d: Math.max(0, 2.1 - offset * 0.2),
      deepMin: 68 + offset,
      remMin: 95,
      lightMin: 210,
      awakeMin: 22,
    },
    vitals: {
      hrv,
      hrvBaseline,
      rhr,
      rhrBaseline,
      stressAvg: 28 + (offset % 4) * 3,
      stressMax: 52 + (offset % 5) * 4,
      bodyBatteryNow: curves.bodyBattery[curves.bodyBattery.length - 1]?.value ?? 35,
      bodyBatteryMin: Math.min(...curves.bodyBattery.map((p) => p.value)),
      bodyBatteryMax: Math.max(...curves.bodyBattery.map((p) => p.value)),
      vo2max: 44 + (offset % 2),
      fitnessAge: 36 - Math.floor(offset / 3),
      chronologicalAge: 38,
    },
    curves,
    coach: { morning: "", evening: "" },
  };

  day.coach.morning = buildCoachMessage(day, "morning");
  day.coach.evening = buildCoachMessage(day, "evening");
  return day;
}

export function getSampleDashboard(): DashboardData {
  const today = new Date();
  const history: DailySummary[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    history.push(makeDay(d.toISOString().slice(0, 10), i));
  }

  const month = history[0].date.slice(0, 7);

  return {
    device: "Garmin Venu 2",
    syncedAt: new Date().toISOString(),
    source: "demo",
    today: history[0],
    history,
    weekly: weeklyStats(history),
    monthWorkouts: { month, workouts: collectMonthWorkoutsFromHistory(history, month) },
  };
}
