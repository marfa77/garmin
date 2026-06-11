"use client";

import { CoachPersonaProvider } from "@/lib/coach-persona";
import { LocaleProvider } from "@/lib/i18n";
import { AppShell } from "./AppShell";
import type { DashboardData } from "@/lib/types";

export function Dashboard({ data }: { data: DashboardData }) {
  return (
    <LocaleProvider>
      <CoachPersonaProvider>
        <AppShell data={data} />
      </CoachPersonaProvider>
    </LocaleProvider>
  );
}
