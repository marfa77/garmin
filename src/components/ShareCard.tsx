"use client";

import { ContributorBars } from "./ContributorBars";
import { SleepHypnogram } from "./SleepHypnogram";
import { WhoopRing } from "./WhoopRing";
import { recoveryContributorBars } from "@/lib/contributors";
import { normalizeCoach } from "@/lib/coach-types";
import { useI18n, translateReadinessLabel } from "@/lib/i18n";
import { READINESS_COLORS, isOptimalDay } from "@/lib/readiness";
import { coachFallbacks } from "@/lib/whoop-copy";
import type { DashboardData, ReadinessZone } from "@/lib/types";

const RING = { sleep: "#8ecae6", recovery: "#3ecf8e", strain: "#5b9bd5" };

export function ShareCard({
  data,
  backgroundUrl,
}: {
  data: DashboardData;
  backgroundUrl?: string | null;
}) {
  const { t, locale } = useI18n();
  const { today } = data;
  const coach = normalizeCoach(today.coach, coachFallbacks(today, t), { locale });
  const contributors = recoveryContributorBars(today, t);
  const optimal = isOptimalDay(today.recovery.score, today.sleep.score);
  const readinessZone = (today.vitals.readinessZone ?? "moderate") as ReadinessZone;
  const readinessColors = READINESS_COLORS[readinessZone];
  const dateLabel = new Date(today.date).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      id="share-card-export"
      className="relative mx-auto aspect-[9/16] w-[360px] overflow-hidden rounded-[28px] border border-zinc-700/50 text-white shadow-2xl"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {backgroundUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black/95" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(62,207,142,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(91,155,213,0.12), transparent), linear-gradient(180deg, #0a0a0b 0%, #000 100%)",
          }}
        />
      )}

      <div className="relative flex h-full flex-col px-5 pb-6 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-zinc-500">{t.share.wellness}</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">{dateLabel}</p>
          </div>
          {optimal && (
            <span className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              {t.rings.crown}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-700/40 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t.share.readiness}</p>
            <p className="text-4xl font-semibold tabular-nums">{today.vitals.readinessScore ?? today.recovery.score}</p>
          </div>
          <p className={`text-sm font-semibold uppercase ${readinessColors.text}`}>
            {translateReadinessLabel(today.vitals.readinessLabel, t)}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-center gap-1">
          <WhoopRing
            value={`${today.sleep.score}%`}
            label={t.rings.sleep}
            pct={today.sleep.score}
            color={RING.sleep}
            showCrown={today.sleep.score >= 85}
            crownLabel={t.rings.crown}
          />
          <div className="-mb-2">
            <WhoopRing
              size="lg"
              value={`${today.recovery.score}%`}
              label={t.rings.recovery}
              pct={today.recovery.score}
              color={RING.recovery}
              showCrown={today.recovery.score >= 85}
              crownLabel={t.rings.crown}
            />
          </div>
          <WhoopRing
            value={today.strain.current.toFixed(1)}
            label={t.rings.strain}
            pct={(today.strain.current / 21) * 100}
            color={RING.strain}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px]">
          {[
            { l: t.heart.vo2, v: today.vitals.vo2max },
            { l: t.heart.hrv, v: today.vitals.hrv },
            { l: t.heart.rhr, v: today.vitals.rhr },
            { l: "BB", v: today.vitals.bodyBatteryNow },
          ].map((m) => (
            <div key={m.l} className="rounded-lg border border-zinc-800/60 bg-black/30 py-2">
              <p className="text-zinc-500">{m.l}</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-white">{m.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-center text-xs text-zinc-300">
          {t.share.fitnessAgeLine}{" "}
          <span className="font-semibold text-white">{today.vitals.fitnessAge}</span>
          <span className="text-zinc-600">
            {" "}
            · {t.share.chronoShort} {today.vitals.chronologicalAge}
          </span>
          {today.vitals.respirationRate != null && (
            <span className="text-zinc-600">
              {" "}
              · {t.share.respShort} {today.vitals.respirationRate}
            </span>
          )}
        </div>

        <div className="mt-3 flex-1 overflow-hidden">
          <ContributorBars items={contributors} compact />
        </div>

        {(today.sleep.hypnogram?.length ?? 0) > 0 && (
          <div className="mt-2">
            <SleepHypnogram segments={today.sleep.hypnogram!} compact />
          </div>
        )}

        <div className="mt-3 rounded-xl border border-zinc-700/40 bg-black/40 p-3 backdrop-blur-sm">
          <p className="text-sm font-semibold leading-snug text-white">{coach.morning.headline}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{coach.morning.action}</p>
        </div>

        <p className="mt-3 text-center text-[9px] uppercase tracking-[0.35em] text-zinc-600">
          {t.share.watermark} · {data.device}
        </p>
      </div>
    </div>
  );
}
