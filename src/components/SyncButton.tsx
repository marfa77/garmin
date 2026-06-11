"use client";

import { useDashboard } from "@/lib/DashboardProvider";
import { useI18n } from "@/lib/i18n";
import { SyncIcon } from "./SyncIcon";

export function SyncButton() {
  const { syncing, sync, syncError, clearSyncError } = useDashboard();
  const { t } = useI18n();

  const iconState = syncing ? "spinning" : syncError ? "error" : "idle";

  return (
    <button
      type="button"
      onClick={() => {
        if (syncing) return;
        clearSyncError();
        void sync();
      }}
      disabled={syncing}
      aria-busy={syncing}
      aria-label={syncing ? t.sync.running : t.sync.button}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-wait ${
        syncing
          ? "border-sky-600/60 bg-sky-950/60 text-sky-200"
          : syncError
            ? "border-rose-800/60 bg-rose-950/40 text-rose-300 hover:border-rose-600"
            : "border-sky-800/60 bg-sky-950/40 text-sky-300 hover:border-sky-600 hover:text-sky-100"
      }`}
      title={t.sync.hint}
    >
      <SyncIcon state={iconState} size={15} />
      <span className="sr-only">{syncing ? t.sync.running : t.sync.button}</span>
    </button>
  );
}
