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
import { coachFallbacks } from "@/lib/whoop-copy";
import type { DailySummary } from "@/lib/types";

export function SleepView({ today, history }: { today: DailySummary; history: DailySummary[] }) {
  const { t, locale } = useI18n();
  const contributors = sleepContributorBars(today, history, t);
  const coach = normalizeCoach(today.coach, coachFallbacks(today, t), { locale });
  const typical = sleepTypicalRanges(history);
  const restorative = restorativeSleep(today);
  const insight = sleepPerformanceInsight(today, contributors, t);

  return (
    <DashboardGrid>
      <DashboardTile span="1/4" className="flex items-center justify-center py-4">
        <WhoopRing
          size="lg"
          value={`${today.sleep.score}%`}
          label={t.rings.sleepPerformance}
          pct={today.sleep.score}
          color="#8ecae6"
          showCrown={today.sleep.score >= 85}
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

      {(today.sleep.hypnogram?.length ?? 0) > 0 && (
        <DashboardTile span="1/2" noPadding className="overflow-hidden !p-4">
          <SleepHypnogram segments={today.sleep.hypnogram!} />
        </DashboardTile>
      )}

      <DashboardTile span={(today.sleep.hypnogram?.length ?? 0) > 0 ? "1/2" : "full"} noPadding className="overflow-hidden !p-4">
        <SleepStageRows today={today} typical={typical} />
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
