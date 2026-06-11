"use client";

import Link from "next/link";
import { useState } from "react";
import { CoachPersonaToggle } from "./CoachPersonaToggle";
import { LocaleToggle } from "./LocaleToggle";
import { ShareSheet } from "./ShareSheet";
import { TabBar, type TabId } from "./TabBar";
import { OverviewView } from "./views/OverviewView";
import { RecoveryView } from "./views/RecoveryView";
import { SleepView } from "./views/SleepView";
import { StrainView } from "./views/StrainView";
import { useDashboard } from "@/lib/DashboardProvider";
import { useI18n } from "@/lib/i18n";
import { SyncButton } from "./SyncButton";

export function AppShell({ mode = "full" }: { mode?: "full" | "demo" }) {
  const isDemo = mode === "demo";
  const { t, locale } = useI18n();
  const { data } = useDashboard();
  const [tab, setTab] = useState<TabId>("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const { today, device, history } = data;

  const dateLabel = new Date(today.date).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`dashboard-shell mesh-bg ${isDemo ? "min-h-0" : "min-h-screen"}`}>
      <header className={`sticky top-0 z-20 border-b border-zinc-800/80 bg-black/85 backdrop-blur-md ${isDemo ? "pt-12" : ""}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
              {t.common.wellness}
            </p>
            <h1 className="text-lg font-semibold text-white sm:text-xl">{dateLabel}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-zinc-800 px-2 py-1 sm:flex">
              <button type="button" className="px-1 text-zinc-600 hover:text-zinc-400" aria-label="Previous day">
                ‹
              </button>
              <span className="text-xs text-zinc-500">{device}</span>
              <button type="button" className="px-1 text-zinc-600 hover:text-zinc-400" aria-label="Next day">
                ›
              </button>
            </div>
            {!isDemo && <SyncButton />}
            <CoachPersonaToggle />
            <LocaleToggle />
            {isDemo ? (
              <Link
                href="/login"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              >
                {t.landing.demoCta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              >
                {t.common.share}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:flex lg:gap-8 lg:px-8">
        <aside className="mb-4 shrink-0 lg:mb-0 lg:w-52">
          <TabBar active={tab} onChange={setTab} variant="pills" />
          <div className="mt-6 hidden lg:block">
            <TabBar active={tab} onChange={setTab} variant="sidebar" />
          </div>
          <p className="mt-8 hidden text-[10px] leading-relaxed text-zinc-600 lg:block">
            {isDemo ? t.landing.demoFootnote : data.source === "garmin" ? t.common.live : t.common.demo}
            {data.coachMeta ? ` · ${t.common.coach}` : ""}
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === "overview" && <OverviewView data={data} onNavigate={setTab} />}
          {tab === "recovery" && <RecoveryView today={today} />}
          {tab === "sleep" && <SleepView today={today} history={history} />}
          {tab === "strain" && <StrainView data={data} />}

        </main>
      </div>

      {shareOpen && <ShareSheet data={data} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
