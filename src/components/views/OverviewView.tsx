"use client";

import { CoachSection } from "../CoachSection";
import { ContributorBars } from "../ContributorBars";
import { DashboardGrid, DashboardTile } from "../DashboardTile";
import { DayCurvesClient } from "../DayCurvesClient";
import { FitnessAgeCard } from "../FitnessAgeCard";
import { HeartHealthHero } from "../HeartHealthHero";
import { HeroInsightCard } from "../HeroInsightCard";
import { IconBolt, IconPulse } from "../icons";
import { MetricRow } from "../MetricRow";
import { ReadinessCard } from "../ReadinessCard";
import { WhoopRing } from "../WhoopRing";
import { WeekTrendChartsClient } from "../WeekTrendChartsClient";
import { recoveryContributorBars } from "@/lib/contributors";
import { heroInsights } from "@/lib/hero-insights";
import { useI18n } from "@/lib/i18n";
import { heartHealthStatus, keyStatistics, strainRemaining } from "@/lib/interpretations";
import { trainingBalance } from "@/lib/training-balance";
import { normalizeCoach } from "@/lib/coach-types";
import { isOptimalDay } from "@/lib/readiness";
import { zoneLabel, coachFallbacks } from "@/lib/whoop-copy";
import type { DashboardData, ReadinessZone } from "@/lib/types";
import type { TabId } from "../TabBar";

const COLORS = { sleep: "#8ecae6", recovery: "#3ecf8e", strain: "#5b9bd5" };

export function OverviewView({
  data,
  onNavigate,
}: {
  data: DashboardData;
  onNavigate: (tab: TabId) => void;
}) {
  const { t, locale } = useI18n();
  const { today, history } = data;
  const coach = normalizeCoach(today.coach, coachFallbacks(today, t), { locale });
  const accent = today.recovery.zone === "green" ? "emerald" : today.recovery.zone === "yellow" ? "amber" : "rose";
  const heart = heartHealthStatus(today, t);
  const stats = keyStatistics(today, t);
  const remaining = strainRemaining(today);
  const contributors = recoveryContributorBars(today, t);
  const optimal = isOptimalDay(today.recovery.score, today.sleep.score);
  const heroes = heroInsights(today, t);
  const training = trainingBalance(today, history, t);

  return (
    <DashboardGrid>
      {today.vitals.readinessScore != null && (
        <DashboardTile span="1/4" noPadding className="overflow-hidden">
          <ReadinessCard
            score={today.vitals.readinessScore}
            zone={(today.vitals.readinessZone ?? "moderate") as ReadinessZone}
            label={today.vitals.readinessLabel ?? "Moderate"}
          />
        </DashboardTile>
      )}

      <DashboardTile span="1/2" className="flex flex-col items-center justify-center py-6">
        <div className="flex items-end justify-center gap-4">
          <WhoopRing
            value={`${today.sleep.score}%`}
            label={t.rings.sleep}
            pct={today.sleep.score}
            color={COLORS.sleep}
            showCrown={today.sleep.score >= 85}
            crownLabel={t.rings.crown}
            onClick={() => onNavigate("sleep")}
          />
          <WhoopRing
            value={`${today.recovery.score}%`}
            label={t.rings.recovery}
            pct={today.recovery.score}
            color={COLORS.recovery}
            size="lg"
            showCrown={today.recovery.score >= 85}
            crownLabel={t.rings.crown}
            onClick={() => onNavigate("recovery")}
          />
          <WhoopRing
            value={today.strain.current.toFixed(1)}
            label={t.rings.strain}
            sublabel={
              today.strain.dailyActivity
                ? `${today.strain.dailyActivity.steps.toLocaleString()} ${t.strain.steps.toLowerCase()}`
                : undefined
            }
            pct={(today.strain.current / 21) * 100}
            color={COLORS.strain}
            onClick={() => onNavigate("strain")}
          />
        </div>
        {optimal && (
          <p className="mt-4 text-center text-xs font-medium text-amber-300/90">{t.overview.optimalDay}</p>
        )}
      </DashboardTile>

      <DashboardTile span="1/4" className="space-y-3 !p-4">
        {heroes.map((h) => (
          <HeroInsightCard key={h.id} insight={h} />
        ))}
      </DashboardTile>

      <DashboardTile span="2/3" noPadding className="overflow-hidden">
        <CoachSection
          label={`${t.common.today} · ${zoneLabel(today.recovery.zone, t)}`}
          coach={coach.morning}
          training={training}
          accent={accent}
        />
      </DashboardTile>

      <DashboardTile span="1/3">
        {remaining > 0 && (
          <p className="mb-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2 text-center text-xs text-zinc-400">
            {t.overview.strainRemaining.replace("{n}", remaining.toFixed(1))}
          </p>
        )}
        <ContributorBars items={contributors} />
      </DashboardTile>

      <DashboardTile span="1/2" noPadding className="overflow-hidden">
        <HeartHealthHero
          vo2max={today.vitals.vo2max}
          fitnessAge={today.vitals.fitnessAge}
          chronologicalAge={today.vitals.chronologicalAge}
          hrv={today.vitals.hrv}
          rhr={today.vitals.rhr}
          respirationRate={today.vitals.respirationRate}
          insight={heart.insight}
          statusLabel={heart.label}
        />
      </DashboardTile>

      <DashboardTile span="1/4" noPadding className="overflow-hidden">
        <FitnessAgeCard
          fitnessAge={today.vitals.fitnessAge}
          chronologicalAge={today.vitals.chronologicalAge}
          vo2max={today.vitals.vo2max}
          achievableFitnessAge={today.vitals.achievableFitnessAge}
          fitnessAgeSource={today.vitals.fitnessAgeSource}
          fitnessAgeTips={today.vitals.fitnessAgeTips}
        />
      </DashboardTile>

      <DashboardTile span="1/4" title={t.overview.keyStats}>
        <div className="-mx-2">
          {stats.map((s) => (
            <MetricRow
              key={s.id}
              icon={<IconPulse className="h-4 w-4" />}
              label={s.label}
              value={`${s.value}`}
              hint={s.hint}
              status={s.status}
            />
          ))}
        </div>
      </DashboardTile>

      <DashboardTile span="full" title={t.overview.weekTrends}>
        <WeekTrendChartsClient history={history} variant="overview" layout="grid" />
      </DashboardTile>

      <DashboardTile span="2/3" noPadding className="overflow-hidden !p-0">
        <DayCurvesClient bodyBattery={today.curves.bodyBattery} stress={today.curves.stress} />
      </DashboardTile>

      <DashboardTile span="1/3" title={t.strain.activities}>
        {today.strain.workouts.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.strain.noWorkouts}</p>
        ) : (
          <div className="space-y-2">
            {today.strain.workouts.map((w) => (
              <div key={w.name} className="flex items-center justify-between rounded-xl bg-zinc-900/60 px-3 py-3">
                <div className="flex items-center gap-2">
                  <IconBolt className="h-4 w-4 shrink-0 text-sky-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{w.name}</p>
                    <p className="text-xs text-zinc-500">
                      {w.durationMin} {t.common.min}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-sky-400">{w.strain.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </DashboardTile>
    </DashboardGrid>
  );
}
