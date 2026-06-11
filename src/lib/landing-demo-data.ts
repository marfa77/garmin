import { getSampleDashboard } from "./sample-data";
import type { CoachBundle, CoachMessage } from "./coach-types";
import type { DailySummary, DashboardData, SleepSegment } from "./types";

const DEMO_COACH_CARING_RU: CoachMessage = {
  headline: "Ты готов работать — отличное восстановление",
  insight:
    "Сон и сердечные сигналы поддерживают — HRV на уровне базы, пульс покоя ниже обычного. Есть запас для качественной нагрузки, но долг сна за неделю всё ещё тянет вниз — сегодня вечером это главный рычаг.",
  dynamics:
    "За неделю восстановление держалось в зелёной зоне 5 из 7 дней. Пульс покоя снижается — тело адаптируется к нагрузке. Сон стабилизировался после провала в середине недели.",
  progress:
    "Ты выдержал ритм: тяжёлые дни чередовались с лёгкими, без перегруза. Recovery вырос с 78% до 89% — это результат дисциплины, а не случайность.",
  action: "Запланируй целевую сессию — темп или интервалы — в пределах целевой нагрузки 14–18.",
  watchouts: [
    "Долг сна ~4.2ч за 7 дней — защити отбой сегодня.",
    "Strain пока в нижней части цели — есть место для осмысленной работы.",
  ],
};

const DEMO_COACH_CARING_EN: CoachMessage = {
  headline: "You're ready to perform",
  insight:
    "Sleep and heart signals look supportive — HRV at baseline, resting HR below your norm. You've got bandwidth for quality work; the main lever tonight is chipping away at your weekly sleep debt.",
  dynamics:
    "Recovery stayed green 5 of 7 days this week. Resting heart rate is trending down — your body is absorbing training well. Sleep steadied after a mid-week dip.",
  progress:
    "You held the rhythm: hard days followed by lighter ones without overreaching. Recovery climbed from 78% to 89% — that's discipline, not luck.",
  action: "Plan purposeful work — tempo or intervals — inside your 14–18 strain target.",
  watchouts: [
    "Sleep debt is ~4.2h over 7 days — protect bedtime tonight.",
    "Strain is still in the lower band of your target — room for a focused session.",
  ],
};

const DEMO_COACH_SARCASTIC_RU: CoachMessage = {
  headline: "89% recovery при таком сне? Подозрительно удачно",
  insight:
    "Часы говорят «готов», долг сна говорит «ты копишь отбой как бонусные мили». Пульс покоя, правда, красивый — видимо, организм пока терпит твой график.",
  dynamics:
    "Неделя зелёная, но сон местами как у студента перед сессией. Нагрузка скачет — то 18, то 9 — зато recovery не сдался окончательно.",
  progress:
    "Ты снизил пульс покоя на 6 ударов за неделю. Либо тренируешься умнее, либо меньше паникуешь по утрам — оба варианта засчитываются.",
  action: "Добавь осмысленную нагрузку, пока recovery ещё верит в тебя.",
  watchouts: [
    "Долг сна не исчезнет, если только мечтать о 7.5 часах.",
    "Strain 14.6 — нормально, но не геройство; завтра тоже понадобится сон.",
  ],
};

const DEMO_COACH_SARCASTIC_EN: CoachMessage = {
  headline: "89% recovery? Suspiciously competent",
  insight:
    "Your watch says go; your sleep debt says you're hoarding bedtime like airline miles. Resting HR is genuinely good though — your body hasn't filed a complaint yet.",
  dynamics:
    "Green recovery most of the week while sleep was occasionally 'exam season'. Strain bounced between 18 and 9 — at least you didn't fully overcook it.",
  progress:
    "Resting HR dropped 6 bpm this week. Either smarter training or less morning panic — both count.",
  action: "Add purposeful load while recovery still believes in you.",
  watchouts: [
    "Sleep debt won't vanish from wishing alone.",
    "Strain 14.6 is fine, not heroic — tomorrow still needs sleep.",
  ],
};

function makeHypnogram(): SleepSegment[] {
  return [
    { level: "awake", minutes: 12, start: "23:05" },
    { level: "light", minutes: 38, start: "23:17" },
    { level: "deep", minutes: 68, start: "23:55" },
    { level: "light", minutes: 42, start: "01:03" },
    { level: "rem", minutes: 88, start: "01:45" },
    { level: "light", minutes: 55, start: "03:13" },
    { level: "deep", minutes: 34, start: "04:08" },
    { level: "rem", minutes: 52, start: "04:42" },
    { level: "light", minutes: 28, start: "05:34" },
    { level: "awake", minutes: 10, start: "06:02" },
  ];
}

function patchToday(day: DailySummary): DailySummary {
  const coach: CoachBundle = {
    morning: DEMO_COACH_CARING_EN,
    morningRu: DEMO_COACH_CARING_RU,
    morningSarcastic: DEMO_COACH_SARCASTIC_EN,
    morningSarcasticRu: DEMO_COACH_SARCASTIC_RU,
    evening: {
      headline: "Solid pacing today",
      insight: "You landed in the sweet spot — enough stimulus without compromising recovery.",
      action: "Wind down early — you're still ~0.6h short on sleep tonight.",
    },
    eveningRu: {
      headline: "Хороший темп дня",
      insight: "Попал в sweet spot — достаточно стимула без удара по recovery.",
      action: "Замедлись вечером — до нормы сна ещё ~0.6ч.",
    },
  };

  return {
    ...day,
    recovery: {
      score: 89,
      zone: "green",
      drivers: [
        { factor: "hrv", label: "HRV", value: 48, baseline: 45, delta: "+7%", impact: "positive" },
        { factor: "sleep", label: "Sleep", value: "77%", impact: "medium" },
        { factor: "load", label: "Prior strain", value: 13.2, impact: "medium" },
        { factor: "rhr", label: "Resting HR", value: 52, baseline: 58, delta: "-6 bpm", impact: "positive" },
      ],
    },
    strain: {
      ...day.strain,
      current: 14.6,
      workoutStrain: 11.2,
      lifestyleStrain: 3.4,
      targetMin: 14,
      targetMax: 18,
      workouts: [
        {
          name: "Morning Run",
          type: "running",
          date: day.date,
          durationMin: 42,
          strain: 11.2,
          avgHr: 142,
          maxHr: 158,
          calories: 380,
          distanceKm: 6.2,
          paceMinPerKm: 6.77,
          startTime: "07:30",
          hrZones: { z1: 8, z2: 18, z3: 12, z4: 4, z5: 0 },
        },
      ],
      dailyActivity: {
        steps: 8420,
        stepGoal: 10000,
        activeCalories: 520,
        bmrCalories: 1170,
        totalCalories: 1690,
        distanceKm: 6.8,
        moderateIntensityMin: 28,
        vigorousIntensityMin: 18,
      },
    },
    sleep: {
      score: 77,
      hours: 6.9,
      need: 7.5,
      debt7d: 4.2,
      deepMin: 102,
      remMin: 140,
      lightMin: 163,
      awakeMin: 22,
      hypnogram: makeHypnogram(),
    },
    vitals: {
      ...day.vitals,
      hrv: 48,
      hrvBaseline: 45,
      rhr: 52,
      rhrBaseline: 58,
      stressAvg: 26,
      stressMax: 48,
      bodyBatteryNow: 68,
      bodyBatteryMin: 22,
      bodyBatteryMax: 94,
      vo2max: 46,
      fitnessAge: 39,
      chronologicalAge: 45,
      achievableFitnessAge: 37,
      fitnessAgeSource: "garmin",
      fitnessAgeTips: [
        "Add ~12 vigorous minutes per week to lower fitness age.",
        "Consistency beats spikes — protect sleep timing.",
      ],
      respirationRate: 14.2,
      readinessScore: 82,
      readinessZone: "high",
      readinessLabel: "High",
    },
    curves: {
      bodyBattery: [
        { time: "06:00", value: 88 },
        { time: "08:00", value: 72 },
        { time: "10:00", value: 58 },
        { time: "12:00", value: 45 },
        { time: "14:00", value: 52 },
        { time: "16:00", value: 61 },
        { time: "18:00", value: 68 },
        { time: "20:00", value: 54 },
      ],
      stress: [
        { time: "06:00", value: 18 },
        { time: "08:00", value: 32 },
        { time: "10:00", value: 28 },
        { time: "12:00", value: 22 },
        { time: "14:00", value: 35 },
        { time: "16:00", value: 30 },
        { time: "18:00", value: 24 },
        { time: "20:00", value: 20 },
      ],
    },
    coach,
  };
}

/** Polished sample dashboard for the marketing landing — fully interactive, not real user data. */
export function getLandingDemoDashboard(): DashboardData {
  const base = getSampleDashboard();
  const today = patchToday(base.today);
  const history = base.history.map((d, i) => (i === 0 ? today : d));

  return {
    ...base,
    device: "Garmin Venu 2",
    source: "demo",
    syncedAt: new Date().toISOString(),
    today,
    history,
    weekly: {
      ...base.weekly,
      avgRecovery: 82,
      avgStrain: 13.4,
      avgSleep: 76,
      greenDays: 5,
      balanceScore: 78,
      narrative: "A strong week — recovery stayed green most days.",
      narrativeRu: "Сильная неделя — recovery чаще в зелёной зоне.",
    },
    coachMeta: {
      provider: "openrouter",
      model: "google/gemini-2.5-flash",
      generatedAt: new Date().toISOString(),
    },
  };
}
