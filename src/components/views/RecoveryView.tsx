"use client";

import { CoachSection } from "../CoachSection";
import { ContributorBars } from "../ContributorBars";
import { DashboardGrid, DashboardTile } from "../DashboardTile";
import { FitnessAgeCard } from "../FitnessAgeCard";
import { IconPulse } from "../icons";
import { MetricRow } from "../MetricRow";
import { RecoveryDrivers } from "../RecoveryDrivers";
import { WhoopRing } from "../WhoopRing";
import { recoveryContributorBars } from "@/lib/contributors";
import { useI18n } from "@/lib/i18n";
import { recoveryMetrics } from "@/lib/interpretations";
import { normalizeCoach } from "@/lib/coach-types";
import { zoneLabel, coachFallbacks } from "@/lib/whoop-copy";
import type { DailySummary } from "@/lib/types";

export function RecoveryView({ today }: { today: DailySummary }) {
  const { t, locale } = useI18n();
  const metrics = recoveryMetrics(today, t);
  const coach = normalizeCoach(today.coach, coachFallbacks(today, t), { locale });
  const contributors = recoveryContributorBars(today, t);
  const color = today.recovery.zone === "green" ? "#3ecf8e" : today.recovery.zone === "yellow" ? "#fbbf24" : "#f87171";

  return (
    <DashboardGrid>
      <DashboardTile span="1/3" className="flex items-center justify-center py-6">
        <WhoopRing
          size="lg"
          value={`${today.recovery.score}%`}
          label={t.rings.recovery}
          sublabel={zoneLabel(today.recovery.zone, t)}
          pct={today.recovery.score}
          color={color}
          showCrown={today.recovery.score >= 85}
          crownLabel={t.rings.crown}
        />
      </DashboardTile>

      <DashboardTile span="2/3">
        <ContributorBars items={contributors} />
      </DashboardTile>

      <DashboardTile span="1/2" noPadding className="overflow-hidden">
        <FitnessAgeCard
          fitnessAge={today.vitals.fitnessAge}
          chronologicalAge={today.vitals.chronologicalAge}
          vo2max={today.vitals.vo2max}
          achievableFitnessAge={today.vitals.achievableFitnessAge}
          fitnessAgeSource={today.vitals.fitnessAgeSource}
          fitnessAgeTips={today.vitals.fitnessAgeTips}
        />
      </DashboardTile>

      <DashboardTile span="1/2" noPadding className="overflow-hidden">
        <RecoveryDrivers drivers={today.recovery.drivers} />
      </DashboardTile>

      <DashboardTile span="1/2" title={t.contributors.hrv}>
        <div className="-mx-2">
          {metrics.map((m) => (
            <MetricRow
              key={m.id}
              icon={<IconPulse className="h-4 w-4" />}
              label={m.label}
              value={m.value}
              unit={m.unit}
              hint={m.hint}
              trend={m.trend}
              status={m.status}
            />
          ))}
        </div>
      </DashboardTile>

      <DashboardTile span="1/2" noPadding className="overflow-hidden">
        <CoachSection label={t.common.recommendation} coach={coach.morning} accent="emerald" />
      </DashboardTile>

      <DashboardTile span="full">
        <p className="text-xs leading-relaxed text-zinc-500">{t.sleep.footer}</p>
      </DashboardTile>
    </DashboardGrid>
  );
}
