"use client";

import { CoachPersonaProvider } from "@/lib/coach-persona";
import { DashboardProvider } from "@/lib/DashboardProvider";
import { LocaleProvider } from "@/lib/i18n";
import { AppShell } from "./AppShell";
import type { DashboardData } from "@/lib/types";

type DashboardProps = {
  data: DashboardData;
  /** Skip LocaleProvider when parent already wraps i18n (landing embed). */
  embedded?: boolean;
  mode?: "full" | "demo";
};

function DashboardInner({ data, mode }: DashboardProps) {
  return (
    <CoachPersonaProvider>
      <DashboardProvider initialData={data}>
        <AppShell mode={mode ?? "full"} />
      </DashboardProvider>
    </CoachPersonaProvider>
  );
}

export function Dashboard({ data, embedded, mode }: DashboardProps) {
  const inner = <DashboardInner data={data} embedded={embedded} mode={mode} />;
  if (embedded) return inner;
  return <LocaleProvider>{inner}</LocaleProvider>;
}
