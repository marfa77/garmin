#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = process.env.DATA_PATH || path.join(ROOT, "data", "dashboard.json");
const PUBLIC_DATA_PATH = process.env.PUBLIC_DATA_PATH || path.join(ROOT, "public", "data", "dashboard.json");

dotenv.config({ path: path.join(ROOT, ".env") });

const MODEL = process.env.OPENROUTER_COACH_MODEL || "google/gemini-2.5-flash";

const MASTER_COACH_EN = `You are the world's best wellness coach — warm, wise, and deeply invested in this person's progress.

You've followed them for 7–14 days: sleep, recovery, heart signals, stress, energy, training rhythm. You speak like a trusted mentor who genuinely cares — motivating, honest, never clinical.

TASK: A comprehensive read of TODAY woven into recent BODY DYNAMICS. Celebrate real wins. Gently name what needs care. One clear move toward progress.

VOICE:
- Second person ("you"), conversational, encouraging
- Max 3 numbers across ALL fields combined
- No jargon (ACWR, baseline ms, target strain band, HRV ms)
- Weave metrics into story — never bullet-dump raw stats
- No medical diagnosis, no fear, no guilt

COVER in insight: recovery readiness, sleep quality & debt, heart calm (RHR/HRV feel), stress & energy, training balance (under/on track/over).
COVER in dynamics: week-long rhythm — sleep pattern, recovery swings, load waves, what's trending up or down.

Return ONLY valid JSON:
{"headline":"4-7 words — warm energizing verdict","insight":"3-5 sentences — today holistically","dynamics":"3-4 sentences — how the body shifted this week","progress":"1-2 sentences — sincere praise for what they're doing right","watchouts":["2-3 caring notes — supportive, not alarming"],"action":"1 motivating sentence — their best next step"}`;

const MASTER_COACH_RU = `Ты — лучший в мире wellness-коуч. Ты знаешь этого человека уже неделю+: его сон, восстановление, сердце, стресс, энергию, тренировки. Ты искренне заботишься, веришь в его прогресс и говоришь тепло и мотивирующе — как настоящий наставник, не как медицинский отчёт.

Задача: всесторонний разбор СЕГОДНЯ в контексте динамики последних 7–14 дней. Покажи, как менялось тело. Подбодри за реальные успехи. Мягко назови, где нужна забота. Дай один ясный шаг к прогрессу.

ТОН:
- Обращение на «ты»
- Максимум 3 цифры на ВЕСЬ ответ
- Без жаргона и сухих списков метрик
- Вплетай данные в живую историю
- Без диагнозов, паники и чувства вины

В insight: восстановление, сон и долг сна, спокойствие сердца, стресс и энергия, баланс тренировок.
В dynamics: недельный ритм — сон, восстановление, нагрузка, куда движется организм.

Только JSON на русском:
{"headline":"4-7 слов — тёплый заряжающий вердикт","insight":"3-5 предложений — сегодня целиком","dynamics":"3-4 предложения — как менялось тело за неделю","progress":"1-2 предложения — искренняя похвала за прогресс","watchouts":["2-3 заботливые заметки — поддержка, не пугалка"],"action":"1 мотивирующее предложение — лучший шаг сегодня"}`;

const MASTER_SARCASTIC_EN = `You are a savage but secretly caring wellness coach — dry, deadpan, darkly funny. You roast the DATA and habits, never the person's worth. Think: exhausted trainer who says outrageous things but still wants them to improve.

You've tracked them 7–14 days. Today + weekly dynamics — same depth as a master coach, but the voice is sarcastic.

VOICE:
- "You" / second person, witty one-liners, absurd comparisons ("sleep debt that could fund a small country")
- Roast metrics: recovery, sleep debt, low body battery, undertraining, stress — with humor
- Under the sarcasm: real insight and a useful next step
- Max 3 numbers total across all fields
- No slurs, no cruelty, no body-shaming, no medical diagnosis
- Still include training balance — mock it lovingly

Return ONLY valid JSON:
{"headline":"4-8 words — savage punchy opener","insight":"3-5 sentences — today, sarcastically but accurately","dynamics":"3-4 sentences — week trend, dry humor","progress":"1-2 sentences — backhanded compliments for real wins","watchouts":["2-3 witty red flags — caring underneath"],"action":"1 sentence — motivating push, still sarcastic"}`;

const MASTER_SARCASTIC_RU = `Ты — язвительный, но по-своему заботливый wellness-коуч. Сухой юмор, чёрная ирония, подколы по ЦИФРАМ и привычкам — не по достоинству человека. Как уставший тренер: «ты ещё жив?» — но в итоге хочешь, чтобы он прогрессировал.

Видишь 7–14 дней данных. Полный разбор сегодня + динамика недели — та же глубина, но тон саркастичный.

ТОН:
- «Ты», остроумные фразы, гиперболы («с таким долгом сна ты больше похож на труп с амбициями»)
- Подкалывай recovery, сон, Body Battery, недотрен, стресс — с юмором
- Под сарказмом — реальный смысл и полезный шаг
- Максимум 3 цифры на весь ответ
- Без оскорблений, жестокости и диагнозов
- Баланс тренировок — тоже, но с иронией

Только JSON на русском:
{"headline":"4-8 слов — язвительный заголовок","insight":"3-5 предложений — сегодня, саркастично но точно","dynamics":"3-4 предложения — неделя, сухой юмор","progress":"1-2 предложения — комплимент через сарказм за реальные успехи","watchouts":["2-3 остроумных красных флага — забота внутри"],"action":"1 предложение — подталкивающий шаг, всё ещё с иронией"}`;

const SUMMARY_SYSTEM_EN = `Brief daily snapshot for a past day in a wellness timeline. Warm but shorter than the master coach.
Return ONLY JSON: {"headline":"...","insight":"2-3 sentences","watchouts":["..."],"action":"..."}`;

const SUMMARY_SYSTEM_RU = `Краткий снимок прошлого дня для ленты. Тепло, но короче главного коуча.
Только JSON: {"headline":"...","insight":"2-3 предложения","watchouts":["..."],"action":"..."}`;

const EVENING_SYSTEM_EN = `Evening wind-down coach. Reflect on today's pacing and sleep tonight. Same JSON shape with watchouts optional.
Return ONLY JSON: {"headline":"...","insight":"...","watchouts":["..."],"action":"..."}`;

const EVENING_SYSTEM_RU = `Вечерний коуч: отбой и восстановление.
Только чистый JSON без markdown и без обёртки \`\`\`.
{"headline":"...","insight":"...","watchouts":["..."],"action":"..."}`;

async function callLLMRaw(system, userPrompt, maxTokens = 420) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://garmin-wellness.local",
      "X-Title": "Garmin Wellness Dashboard",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

function parseCoach(raw) {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    return { headline: "Listen to your body", insight: cleaned.slice(0, 400), action: "", watchouts: [] };
  }
  let p;
  try {
    p = JSON.parse(match[0]);
  } catch {
    return { headline: "Listen to your body", insight: cleaned.slice(0, 400), action: "", watchouts: [] };
  }
  const watchouts = Array.isArray(p.watchouts)
    ? p.watchouts.map((w) => String(w).trim()).filter(Boolean).slice(0, 4)
    : [];
  return {
    headline: String(p.headline ?? "").trim(),
    insight: String(p.insight ?? "").trim(),
    dynamics: String(p.dynamics ?? "").trim() || undefined,
    progress: String(p.progress ?? "").trim() || undefined,
    action: String(p.action ?? "").trim(),
    watchouts: watchouts.length ? watchouts : undefined,
  };
}

async function callCoach(system, userPrompt, maxTokens = 420) {
  return parseCoach(await callLLMRaw(system, userPrompt, maxTokens));
}

async function callMasterCoach(system, userPrompt) {
  return callCoach(system, userPrompt, 780);
}

function weeklyStory(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const p = JSON.parse(match[0]);
      if (p.insight) return String(p.insight).trim();
      if (p.headline && p.action) return `${p.headline}. ${p.action}`.trim();
    } catch {
      /* plain text */
    }
  }
  return trimmed;
}

function computeTrainingBalance(t, recent) {
  const { current, targetMin, targetMax, workouts = [] } = t.strain;
  const zone = t.recovery.zone;
  const workoutMin = workouts.reduce((s, w) => s + (w.durationMin || 0), 0);
  const remaining = Math.max(0, Math.round(((targetMin + targetMax) / 2 - current) * 10) / 10);

  let status = "on_track";
  if (zone === "red" && current < targetMin) status = "recover";
  else if (current > targetMax || (zone === "red" && current >= targetMin)) status = "overtraining";
  else if (zone === "green" && current < targetMin) status = "undertraining";

  return {
    status,
    strain: current,
    targetMin,
    targetMax,
    remaining,
    recoveryZone: zone,
    workoutsToday: workouts.length,
    totalWorkoutMin: workoutMin,
    workouts: workouts.map((w) => ({
      name: w.name,
      type: w.type,
      durationMin: w.durationMin,
      strain: w.strain,
      avgHr: w.avgHr,
      distanceKm: w.distanceKm,
    })),
    recentStrain: recent.slice(0, 5).map((d) => ({
      date: d.date,
      strain: d.strain?.current,
      recovery: d.recovery?.score,
    })),
  };
}

function hasStructuredMorning(coach) {
  return (
    coach?.morning &&
    typeof coach.morning === "object" &&
    String(coach.morning.headline ?? "").trim() &&
    String(coach.morning.insight ?? "").trim()
  );
}

function applyCoachPatch(data, date, patch) {
  if (data.today?.date === date) {
    data.today.coach = { ...(data.today.coach ?? {}), ...patch };
  }
  const idx = (data.history ?? []).findIndex((d) => d.date === date);
  if (idx >= 0) {
    data.history[idx].coach = { ...(data.history[idx].coach ?? {}), ...patch };
  }
}

function avg(nums) {
  const valid = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (!valid.length) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function computeBodyTrends(history) {
  const days = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  if (days.length < 2) return null;

  const first = days[0];
  const last = days[days.length - 1];
  const recoveryScores = days.map((d) => d.recovery?.score);
  const sleepScores = days.map((d) => d.sleep?.score);
  const strains = days.map((d) => d.strain?.current);

  return {
    spanDays: days.length,
    from: first.date,
    to: last.date,
    recovery: {
      start: first.recovery?.score,
      now: last.recovery?.score,
      delta: (last.recovery?.score ?? 0) - (first.recovery?.score ?? 0),
      avg: avg(recoveryScores),
      greenDays: days.filter((d) => d.recovery?.zone === "green").length,
    },
    sleep: {
      start: first.sleep?.score,
      now: last.sleep?.score,
      avg: avg(sleepScores),
      debtNow: last.sleep?.debt7d,
      hoursNow: last.sleep?.hours,
    },
    strain: {
      avg: avg(strains),
      peak: Math.max(...strains.filter((n) => typeof n === "number")),
      now: last.strain?.current,
    },
    heart: {
      hrvStart: first.vitals?.hrv,
      hrvNow: last.vitals?.hrv,
      rhrStart: first.vitals?.rhr,
      rhrNow: last.vitals?.rhr,
    },
    energy: {
      stressAvgNow: last.vitals?.stressAvg,
      bodyBatteryNow: last.vitals?.bodyBatteryNow,
    },
    dayByDay: days.map((d) => ({
      date: d.date,
      recovery: d.recovery?.score,
      zone: d.recovery?.zone,
      sleep: d.sleep?.score,
      strain: d.strain?.current,
      hrv: d.vitals?.hrv,
      rhr: d.vitals?.rhr,
      stress: d.vitals?.stressAvg,
    })),
  };
}

function buildRichContextForDay(day, history, weekly) {
  const idx = history.findIndex((d) => d.date === day.date);
  const recent = idx >= 0 ? history.slice(idx, idx + 7) : history.slice(0, 7);

  return buildRichContextPayload(day, recent, weekly, history);
}

function buildRichContextPayload(t, recent, weekly, fullHistory = recent) {
  return {
    date: t.date,
    recovery: {
      score: t.recovery.score,
      zone: t.recovery.zone,
      drivers: t.recovery.drivers?.map((d) => ({
        factor: d.factor,
        label: d.label,
        value: d.value,
        delta: d.delta,
        impact: d.impact,
      })),
    },
    training: computeTrainingBalance(t, recent),
    strain: {
      current: t.strain.current,
      workoutStrain: t.strain.workoutStrain,
      lifestyleStrain: t.strain.lifestyleStrain,
      targetMin: t.strain.targetMin,
      targetMax: t.strain.targetMax,
      dailyActivity: t.strain.dailyActivity,
      workouts: t.strain.workouts?.map((w) => ({
        name: w.name,
        type: w.type,
        durationMin: w.durationMin,
        strain: w.strain,
        avgHr: w.avgHr,
        distanceKm: w.distanceKm,
        calories: w.calories,
      })),
    },
    sleep: {
      score: t.sleep.score,
      hours: t.sleep.hours,
      need: t.sleep.need,
      debt7d: t.sleep.debt7d,
      deepMin: t.sleep.deepMin,
      remMin: t.sleep.remMin,
      awakeMin: t.sleep.awakeMin,
    },
    vitals: {
      hrv: t.vitals.hrv,
      hrvBaseline: t.vitals.hrvBaseline,
      rhr: t.vitals.rhr,
      rhrBaseline: t.vitals.rhrBaseline,
      stressAvg: t.vitals.stressAvg,
      stressMax: t.vitals.stressMax,
      bodyBatteryNow: t.vitals.bodyBatteryNow,
      bodyBatteryMin: t.vitals.bodyBatteryMin,
      vo2max: t.vitals.vo2max,
      fitnessAge: t.vitals.fitnessAge,
      chronologicalAge: t.vitals.chronologicalAge,
      achievableFitnessAge: t.vitals.achievableFitnessAge,
      readinessScore: t.vitals.readinessScore,
      readinessLabel: t.vitals.readinessLabel,
      respirationRate: t.vitals.respirationRate,
    },
    week: {
      avgRecovery: weekly?.avgRecovery,
      avgSleep: weekly?.avgSleep,
      avgStrain: weekly?.avgStrain,
      greenDays: weekly?.greenDays,
    },
    recentDays: recent.map((d) => ({
      date: d.date,
      recovery: d.recovery.score,
      sleep: d.sleep.score,
      strain: d.strain.current,
      hrv: d.vitals?.hrv,
      rhr: d.vitals?.rhr,
      stress: d.vitals?.stressAvg,
      bodyBattery: d.vitals?.bodyBatteryNow,
    })),
    bodyTrends: computeBodyTrends(fullHistory),
  };
}

function buildRichContext(data) {
  const history = data.history ?? [];
  return buildRichContextForDay(data.today, history, data.weekly);
}

const WEEKLY_DYNAMICS_EN = `You write a 3-4 sentence story about how this athlete's BODY has evolved over the past week.

Focus on dynamics: recovery swings, sleep rhythm, training load pattern, stress/HRV signals. What's improving, what's slipping, where they're headed. Human and direct — not a metric dump. No medical diagnosis.

Return ONLY JSON: {"insight":"..."}`;

const WEEKLY_DYNAMICS_RU = `Напиши 3-4 предложения о том, как менялся организм атлета за неделю.

Динамика: восстановление, сон, нагрузка, стресс/HRV. Что улучшается, что проседает, куда движется. По-человечески, без списков метрик. Без диагнозов.

Только JSON: {"insight":"..."}`;

function buildWeeklyDynamicsContext(data) {
  const days = [...(data.history ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return {
    week: data.weekly,
    days: days.map((d) => ({
      date: d.date,
      recovery: d.recovery.score,
      zone: d.recovery.zone,
      sleep: d.sleep.score,
      sleepDebt: d.sleep.debt7d,
      strain: d.strain.current,
      hrv: d.vitals.hrv,
      rhr: d.vitals.rhr,
      stress: d.vitals.stressAvg,
      bodyBattery: d.vitals.bodyBatteryNow,
      headline:
        typeof d.coach?.morning === "object" && d.coach.morning.headline
          ? d.coach.morning.headline
          : null,
    })),
  };
}

async function generateWeeklyDynamics(data) {
  const ctx = JSON.stringify(buildWeeklyDynamicsContext(data), null, 2);
  const [enRaw, ruRaw] = await Promise.all([
    callLLMRaw(WEEKLY_DYNAMICS_EN, `Weekly body dynamics:\n${ctx}`, 280),
    callLLMRaw(WEEKLY_DYNAMICS_RU, `Динамика организма за неделю:\n${ctx}`, 280),
  ]);
  return {
    narrative: weeklyStory(enRaw),
    narrativeRu: weeklyStory(ruRaw),
  };
}

async function generateDayMorning(day, data) {
  const ctxJson = JSON.stringify(
    buildRichContextForDay(day, data.history ?? [], data.weekly),
    null,
    2
  );
  const [morning, morningRu] = await Promise.all([
    callCoach(SUMMARY_SYSTEM_EN, `MORNING daily health summary for ${day.date}. Data:\n${ctxJson}`),
    callCoach(SUMMARY_SYSTEM_RU, `Утреннее резюме здоровья за ${day.date}. Данные:\n${ctxJson}`),
  ]);
  return { morning, morningRu };
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error("No data/dashboard.json — run npm run sync:garmin first");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const historyDays = Math.min(
    parseInt(process.env.COACH_HISTORY_DAYS || "7", 10),
    (data.history ?? []).length
  );
  const force = process.env.COACH_FORCE === "true" || process.argv.includes("--force");
  const history = (data.history ?? []).slice(0, historyDays);
  const ctxJson = JSON.stringify(buildRichContext(data), null, 2);

  const quick = process.env.COACH_QUICK === "true";

  console.log(
    `Generating coach with ${MODEL} (quick=${quick}, ${historyDays} days, force=${force})...`
  );

  if (quick) {
    const [morning, morningRu] = await Promise.all([
      callMasterCoach(MASTER_COACH_EN, `MASTER COACH — full dynamic analysis for today. Athlete data:\n${ctxJson}`),
      callMasterCoach(MASTER_COACH_RU, `ГЛАВНЫЙ КОУЧ — полный динамический разбор на сегодня. Данные:\n${ctxJson}`),
    ]);

    applyCoachPatch(data, data.today.date, {
      morning,
      morningRu,
    });

    data.coachMeta = {
      provider: "openrouter",
      model: MODEL,
      generatedAt: new Date().toISOString(),
      quick: true,
    };

    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(DATA_PATH, json);
    fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
    fs.writeFileSync(PUBLIC_DATA_PATH, json);
    console.log("Coach updated (quick):", morning.headline);
    return;
  }

  const [morning, morningRu, morningSarcastic, morningSarcasticRu, evening, eveningRu, weeklyDynamics] =
    await Promise.all([
      callMasterCoach(MASTER_COACH_EN, `MASTER COACH — full dynamic analysis for today. Athlete data:\n${ctxJson}`),
      callMasterCoach(MASTER_COACH_RU, `ГЛАВНЫЙ КОУЧ — полный динамический разбор на сегодня. Данные:\n${ctxJson}`),
      callMasterCoach(
        MASTER_SARCASTIC_EN,
        `SARCASTIC COACH — same data, savage tone. Athlete data:\n${ctxJson}`
      ),
      callMasterCoach(
        MASTER_SARCASTIC_RU,
        `САРКАСТИЧНЫЙ КОУЧ — те же данные, язвительный тон. Данные:\n${ctxJson}`
      ),
      callCoach(EVENING_SYSTEM_EN, `EVENING guidance. Context:\n${ctxJson}`),
      callCoach(EVENING_SYSTEM_RU, `Вечернее руководство. Контекст:\n${ctxJson}`),
      generateWeeklyDynamics(data),
    ]);

  applyCoachPatch(data, data.today.date, {
    morning,
    morningRu,
    morningSarcastic,
    morningSarcasticRu,
    evening,
    eveningRu,
  });

  const pastDays = history.filter((d) => d.date !== data.today.date);
  for (const day of pastDays) {
    if (!force && hasStructuredMorning(day.coach)) {
      console.log(`  skip ${day.date} — already has summary`);
      continue;
    }
    console.log(`  backfill ${day.date}...`);
    const pastCoach = await generateDayMorning(day, data);
    applyCoachPatch(data, day.date, pastCoach);
  }

  data.weekly.narrative = weeklyDynamics.narrative;
  data.weekly.narrativeRu = weeklyDynamics.narrativeRu;
  data.coachMeta = {
    provider: "openrouter",
    model: MODEL,
    generatedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(DATA_PATH, json);
  fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_DATA_PATH, json);
  console.log("Coach updated:", morning.headline);
  if (morning.watchouts?.length) {
    console.log("Watchouts:", morning.watchouts.join(" | "));
  }
  const filled = history.filter((d) => hasStructuredMorning(d.coach)).length;
  console.log(`Timeline summaries: ${filled}/${history.length} days`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
