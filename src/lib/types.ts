import type { CoachBundle } from "./coach-types";

export type RecoveryZone = "green" | "yellow" | "red";
export type ReadinessZone = "prime" | "high" | "moderate" | "low" | "poor";
export type SleepStage = "awake" | "light" | "deep" | "rem";

export interface SleepSegment {
  level: SleepStage;
  minutes: number;
  start?: string;
}

export interface RecoveryDriver {
  factor: string;
  label: string;
  value: number | string;
  baseline?: number | string;
  delta?: string;
  impact: "high" | "medium" | "low" | "positive";
}

export interface TimePoint {
  time: string;
  value: number;
}

export interface HrZoneMinutes {
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  z5: number;
}

export interface DailyActivity {
  steps: number;
  stepGoal: number;
  activeCalories: number;
  bmrCalories: number;
  totalCalories: number;
  distanceKm?: number;
  moderateIntensityMin?: number;
  vigorousIntensityMin?: number;
}

export interface WorkoutSummary {
  name: string;
  type: string;
  durationMin: number;
  strain: number;
  avgHr: number;
  date?: string;
  maxHr?: number;
  calories?: number;
  distanceKm?: number;
  paceMinPerKm?: number;
  startTime?: string;
  hrZones?: HrZoneMinutes;
  moderateIntensityMin?: number;
  vigorousIntensityMin?: number;
  activityId?: number;
}

export interface DailySummary {
  date: string;
  recovery: {
    score: number;
    zone: RecoveryZone;
    drivers: RecoveryDriver[];
  };
  strain: {
    current: number;
    workoutStrain?: number;
    lifestyleStrain?: number;
    targetMin: number;
    targetMax: number;
    workouts: WorkoutSummary[];
    dailyActivity?: DailyActivity;
  };
  sleep: {
    score: number;
    hours: number;
    need: number;
    debt7d: number;
    deepMin: number;
    remMin: number;
    lightMin: number;
    awakeMin: number;
    hypnogram?: SleepSegment[];
  };
  vitals: {
    hrv: number;
    hrvBaseline: number;
    rhr: number;
    rhrBaseline: number;
    stressAvg: number;
    stressMax: number;
    bodyBatteryNow: number;
    bodyBatteryMin: number;
    bodyBatteryMax: number;
    vo2max: number;
    fitnessAge: number;
    chronologicalAge: number;
    achievableFitnessAge?: number;
    fitnessAgeSource?: "garmin" | "estimate";
    fitnessAgeTips?: string[];
    respirationRate?: number;
    readinessScore?: number;
    readinessZone?: ReadinessZone;
    readinessLabel?: string;
  };
  curves: {
    bodyBattery: TimePoint[];
    stress: TimePoint[];
  };
  coach: CoachBundle;
}

export interface MonthWorkouts {
  month: string;
  workouts: WorkoutSummary[];
}

export interface MonthWorkoutTotals {
  sessions: number;
  durationMin: number;
  distanceKm: number | null;
  calories: number | null;
  strain: number;
  avgHr: number | null;
  avgPaceMinPerKm: number | null;
}

export interface DashboardData {
  device: string;
  syncedAt: string;
  source: "demo" | "garmin";
  today: DailySummary;
  history: DailySummary[];
  monthWorkouts?: MonthWorkouts;
  weekly: {
    avgRecovery: number;
    avgStrain: number;
    avgSleep: number;
    greenDays: number;
    balanceScore: number;
    narrative: string;
    narrativeRu?: string;
  };
  coachMeta?: {
    provider: string;
    model: string;
    generatedAt: string;
  };
}
