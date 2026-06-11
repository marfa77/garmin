"use client";

import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";
import { getLandingDemoDashboard } from "@/lib/landing-demo-data";
import { useI18n } from "@/lib/i18n";

const demoData = getLandingDemoDashboard();

export function LandingDemoDashboard() {
  const { t } = useI18n();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-zinc-700/80 bg-black/90 px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            {t.landing.demoBadge}
          </span>
          <span className="hidden text-[10px] text-zinc-500 sm:inline">·</span>
          <span className="hidden text-[10px] text-zinc-400 sm:inline">{t.landing.demoHint}</span>
          <Link
            href="/login"
            className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black hover:bg-emerald-400"
          >
            {t.landing.demoCta}
          </Link>
        </div>
      </div>

      <Dashboard data={demoData} embedded mode="demo" />
    </div>
  );
}
