"use client";

import { LocaleProvider } from "@/lib/i18n";
import { AppShell } from "./AppShell";
import type { DashboardData } from "@/lib/types";

export function Dashboard({ data }: { data: DashboardData }) {
  return (
    <LocaleProvider>
      <AppShell data={data} />
    </LocaleProvider>
  );
}
