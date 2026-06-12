"use client";

import { CoachSection } from "../CoachSection";
import { ContributorBars } from "../ContributorBars";
import { DashboardGrid, DashboardTile } from "../DashboardTile";
import { SleepHypnogram } from "../SleepHypnogram";
import { SleepInsightPanel } from "../SleepInsightPanel";
import { SleepStageRows } from "../SleepStageRows";
import { WhoopRing } from "../WhoopRing";
import { WeekTrendChartsClient } from "../WeekTrendChartsClient";
import { useI18n } from "@/lib/i18n";
import {
  restorativeSleep,
  sleepContributorBars,
  sleepPerformanceInsight,
  sleepTypicalRanges,
} from "@/lib/sleep-contributors";
import { normalizeCoach } from "@/lib/coach-types";
import { hasSleepData, latestSleepNight } from "@/lib/sleep-data";
import { coachFallbacks } from "@/lib/whoop-copy";
import type { DailySummary } from "@/lib/types";

export function SleepView({ today, history }: { today: DailySummary; history: DailySummary[] }) {
  const { t, locale } = useI18n();
  const todayHasSleep = hasSleepData(today);
  const fallbackNight = todayHasSleep ? null : latestSleepNight(history);
  const sleepDay = todayHasSleep ? today : fallbackNight ?? today;
  const showingFallback = Boolean(fallbackNight);

  const contributors = sleepContributorBars(sleepDay, history, t);
  const coach = normalizeCoach(today.coach, coachFallbacks(today, t), { locale });
  const typical = sleepTypicalRanges(history);
  const restorative = restorativeSleep(sleepDay);
  const insight = todayHasSleep
    ? sleepPerformanceInsight(sleepDay, contributors, t)
    : showingFallback
      ? t.sleep.pendingWithFallback
      : t.sleep.pendingToday;

  const fallbackDate = fallbackNight
    ? new Date(fallbackNight.date).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  if (!todayHasSleep && !showingFallback) {
    return (
      <DashboardGrid>
        <DashboardTile span="full" className="py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.rings.sleepPerformance}</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">{t.sleep.pendingToday}</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600">{t.sleep.pendingHint}</p>
        </DashboardTile>
        <DashboardTile span="full" title={t.sleep.trends}>
          <WeekTrendChartsClient history={history} variant="sleep" layout="grid" />
        </DashboardTile>
      </DashboardGrid>
    );
  }

  return (
    <DashboardGrid>
      {showingFallback && (
        <DashboardTile span="full" className="border-amber-900/40 bg-amber-950/20 py-3">
          <p className="text-sm text-amber-200/90">
            {t.sleep.showingLastNight.replace("{date}", fallbackDate ?? "")}
          </p>
        </DashboardTile>
      )}

      <DashboardTile span="1/4" className="flex items-center justify-center py-4">
        <WhoopRing
          size="lg"
          value={sleepDay.sleep.score > 0 ? `${sleepDay.sleep.score}%` : "—"}
          label={t.rings.sleepPerformance}
          pct={sleepDay.sleep.score}
          color="#8ecae6"
          showCrown={sleepDay.sleep.score >= 85}
          crownLabel={t.rings.crown}
        />
      </DashboardTile>

      <DashboardTile span="1/2" title={t.sleep.contributorsTitle}>
        <ContributorBars items={contributors} title="" />
        <div className="mt-4 flex justify-center gap-4 border-t border-zinc-800/80 pt-3 text-[10px] uppercase tracking-wider">
          <span className="text-rose-400">{t.sleep.legendPoor}</span>
          <span className="text-sky-400">{t.sleep.legendSufficient}</span>
          <span className="text-emerald-400">{t.sleep.legendOptimal}</span>
        </div>
      </DashboardTile>

      <DashboardTile span="1/4" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.sleep.restorative}</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-white">{restorative.label}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {t.sleep.deep} + {t.sleep.rem}
        </p>
      </DashboardTile>

      <DashboardTile span="full" noPadding className="overflow-hidden !p-4">
        <SleepInsightPanel insight={insight} />
      </DashboardTile>

      {(sleepDay.sleep.hypnogram?.length ?? 0) > 0 && (
        <DashboardTile span="1/2" noPadding className="overflow-hidden !p-4">
          <SleepHypnogram segments={sleepDay.sleep.hypnogram!} />
        </DashboardTile>
      )}

      <DashboardTile
        span={(sleepDay.sleep.hypnogram?.length ?? 0) > 0 ? "1/2" : "full"}
        noPadding
        className="overflow-hidden !p-4"
      >
        <SleepStageRows today={sleepDay} typical={typical} />
      </DashboardTile>

      <DashboardTile span="full" title={t.sleep.trends}>
        <WeekTrendChartsClient history={history} variant="sleep" layout="grid" />
      </DashboardTile>

      <DashboardTile span="full" noPadding className="overflow-hidden">
        <CoachSection label={t.common.tonight} coach={coach.evening} accent="sky" />
      </DashboardTile>
    </DashboardGrid>
  );
}
