"use client";

import { CoachSection } from "../CoachSection";
import { DashboardGrid, DashboardTile } from "../DashboardTile";
import { MetricRow } from "../MetricRow";
import { WhoopRing } from "../WhoopRing";
import { WorkoutActivityList } from "../WorkoutActivityList";
import { StrainDayPanel } from "../StrainDayPanel";
import { useI18n } from "@/lib/i18n";
import { strainLevel, strainRecommendation } from "@/lib/interpretations";
import { aggregateMonthTotals, monthLabel, resolveMonthWorkouts } from "@/lib/month-workouts";
import { trainingBalance } from "@/lib/training-balance";
import type { DashboardData } from "@/lib/types";

export function StrainView({ data }: { data: DashboardData }) {
  const { today, history } = data;
  const { t, locale } = useI18n();
  const level = strainLevel(today.strain.current, t);
  const rec = strainRecommendation(today, t);
  const training = trainingBalance(today, history, t);
  const month = resolveMonthWorkouts(data);
  const monthTotals = aggregateMonthTotals(month.workouts);
  const monthTitle = monthLabel(month.month, locale);
  const remaining = Math.max(0, (today.strain.targetMin + today.strain.targetMax) / 2 - today.strain.current);
  const midTarget = ((today.strain.targetMin + today.strain.targetMax) / 2).toFixed(1);

  return (
    <DashboardGrid>
      <DashboardTile span="1/3" className="flex items-center justify-center py-6">
        <WhoopRing
          size="lg"
          value={today.strain.current.toFixed(1)}
          label={t.rings.dayStrain}
          sublabel={`${t.rings.target} ${today.strain.targetMin}–${today.strain.targetMax}`}
          pct={(today.strain.current / 21) * 100}
          color="#5b9bd5"
        />
      </DashboardTile>

      <DashboardTile span="2/3" title={t.strain.dayLoad}>
        <StrainDayPanel
          workouts={today.strain.workouts}
          dailyActivity={today.strain.dailyActivity}
          workoutStrain={today.strain.workoutStrain}
          lifestyleStrain={today.strain.lifestyleStrain}
          currentStrain={today.strain.current}
        />
      </DashboardTile>

      <DashboardTile span="1/2" noPadding className="overflow-hidden">
        <CoachSection label={t.strain.guidance} coach={rec} training={training} accent="sky" />
      </DashboardTile>

      <DashboardTile span="1/2">
        <div className="-mx-2">
          <MetricRow
            label={t.strain.remaining}
            value={remaining.toFixed(1)}
            hint={`${t.strain.toMidTarget} (~${midTarget})`}
            trend={remaining > 5 ? "up" : "neutral"}
            status="optimal"
          />
          <MetricRow
            label={t.strain.intensity}
            value={level.label}
            hint={t.strain.loadBand}
            status={today.strain.current > today.strain.targetMax ? "pay_attention" : "good"}
          />
        </div>
      </DashboardTile>

      <DashboardTile span="full" title={t.strain.activityListMonth.replace("{month}", monthTitle)}>
        <WorkoutActivityList workouts={month.workouts} totals={monthTotals} monthLabel={monthTitle} />
      </DashboardTile>
    </DashboardGrid>
  );
}
