"use client";

import { useDashboard } from "@/lib/DashboardProvider";
import { useI18n } from "@/lib/i18n";

export function SyncButton() {
  const { syncing, sync, syncError, clearSyncError } = useDashboard();
  const { t } = useI18n();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          clearSyncError();
          void sync();
        }}
        disabled={syncing}
        className="rounded-lg border border-sky-800/60 bg-sky-950/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-300 transition hover:border-sky-600 hover:text-sky-100 disabled:cursor-wait disabled:opacity-60"
        title={t.sync.hint}
      >
        {syncing ? t.sync.running : t.sync.button}
      </button>
      {syncing && (
        <p className="absolute right-0 top-full z-30 mt-2 max-w-[200px] rounded-lg border border-sky-900/50 bg-zinc-950 px-3 py-2 text-[11px] leading-snug text-sky-300/90 shadow-lg">
          {t.sync.runningHint}
        </p>
      )}
      {syncError && !syncing && (
        <p className="absolute right-0 top-full z-30 mt-2 max-w-[240px] rounded-lg border border-rose-900/50 bg-zinc-950 px-3 py-2 text-[11px] leading-snug text-rose-300 shadow-lg">
          {syncError === "cloud"
            ? t.sync.cloudHint
            : syncError === "Sync failed" || syncError === "Sync worker error (500)"
              ? t.sync.failed
              : syncError}
        </p>
      )}
    </div>
  );
}
