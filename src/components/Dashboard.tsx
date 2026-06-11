"use client";

import { CoachPersonaProvider } from "@/lib/coach-persona";
import { DashboardProvider } from "@/lib/DashboardProvider";
import { LocaleProvider } from "@/lib/i18n";
import { AppShell } from "./AppShell";
import type { DashboardData } from "@/lib/types";

export function Dashboard({ data }: { data: DashboardData }) {
  return (
    <LocaleProvider>
      <CoachPersonaProvider>
        <DashboardProvider initialData={data}>
          <AppShell />
        </DashboardProvider>
      </CoachPersonaProvider>
    </LocaleProvider>
  );
}
