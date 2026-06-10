#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "dashboard.json");
const PUBLIC_DATA_PATH = path.join(ROOT, "public", "data", "dashboard.json");

dotenv.config({ path: path.join(ROOT, ".env") });

const MODEL = process.env.OPENROUTER_COACH_MODEL || "google/gemini-2.5-flash";

const SUMMARY_SYSTEM_EN = `You write a daily health summary for a Garmin/Whoop-style wellness app.

The athlete wants an HONEST answer to: "How am I really doing today? Should I worry? What matters?"

RULES:
- Be direct and human — reassuring when data supports it, candid when something is off. No medical diagnosis, no doom, no jokes about dying.
- headline: 4-8 words — today's verdict (e.g. "You're in good shape", "Ease up today", "Running on reserves").
- insight: 2-4 sentences synthesizing recovery, sleep, heart signals, stress, AND training load vs target band. Say what's working AND what isn't. Max 2 numbers total.
- insight MUST include one clear sentence on training balance: undertraining (below target with green recovery), on track (in band), or overreaching (above target / hard block).
- watchouts: array of 2-3 short bullets — sleep debt, low body battery, stress, OR training mismatch (under/over). Ground each in the data.
- action: 1 sentence — the single best move today.

Never dump metrics. Never use jargon (ACWR, baseline ms, target strain band).
Return ONLY valid JSON:
{"headline":"...","insight":"...","watchouts":["...","..."],"action":"..."}`;

const SUMMARY_SYSTEM_RU = `Ты пишешь ежедневное резюме здоровья для wellness-приложения (Garmin/Whoop).

Человек хочет честный ответ: «Как я сегодня? Есть поводы для тревоги? На что смотреть?»

ПРАВИЛА:
- Прямо и по-человечески — уверенно, когда данные хорошие; честно, когда что-то не так. Без диагнозов и паники.
- headline: 4-8 слов — вердикт дня.
- insight: 2-4 предложения: восстановление, сон, сердце, стресс, тренировочная нагрузка vs цель. Что ок и что нет. Максимум 2 цифры.
- insight ОБЯЗАТЕЛЬНО содержит одно предложение про тренировки: недотренировка, в норме или перетренировка/перегруз.
- watchouts: 2-3 пункта — сон, Body Battery, стресс или дисбаланс нагрузки. Привязка к данным.
- action: 1 предложение — лучший шаг на сегодня.

Без жаргона и списков метрик. Только JSON на русском:
{"headline":"...","insight":"...","watchouts":["...","..."],"action":"..."}`;

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
    action: String(p.action ?? "").trim(),
    watchouts: watchouts.length ? watchouts : undefined,
  };
}

async function callCoach(system, userPrompt) {
  return parseCoach(await callLLMRaw(system, userPrompt));
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

function buildRichContext(data) {
  const t = data.today;
  const recent = (data.history ?? []).slice(0, 7);

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
      avgRecovery: data.weekly?.avgRecovery,
      avgSleep: data.weekly?.avgSleep,
      avgStrain: data.weekly?.avgStrain,
      greenDays: data.weekly?.greenDays,
    },
    recentDays: recent.map((d) => ({
      date: d.date,
      recovery: d.recovery.score,
      sleep: d.sleep.score,
      strain: d.strain.current,
    })),
  };
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error("No data/dashboard.json — run npm run sync:garmin first");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const ctx = buildRichContext(data);
  const ctxJson = JSON.stringify(ctx, null, 2);

  console.log(`Generating daily summary coach with ${MODEL}...`);

  const [morning, morningRu, evening, eveningRu, weekly] = await Promise.all([
    callCoach(SUMMARY_SYSTEM_EN, `MORNING daily health summary. Full athlete data:\n${ctxJson}`),
    callCoach(SUMMARY_SYSTEM_RU, `Утреннее резюме здоровья. Данные атлета:\n${ctxJson}`),
    callCoach(EVENING_SYSTEM_EN, `EVENING guidance. Context:\n${ctxJson}`),
    callCoach(EVENING_SYSTEM_RU, `Вечернее руководство. Контекст:\n${ctxJson}`),
    weeklyStory(
      await callLLMRaw(
        `Write a 2-3 sentence weekly reflection in plain English. No bullet lists. Context: ${JSON.stringify(ctx.week)}`,
        "Weekly story only.",
        200
      )
    ),
  ]);

  data.today.coach = { morning, morningRu, evening, eveningRu };
  data.weekly.narrative = weekly;
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
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
