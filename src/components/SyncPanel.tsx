"use client";

import { useDashboard } from "@/lib/DashboardProvider";
import { useI18n } from "@/lib/i18n";
import { SYNC_STEP_ORDER, type SyncStep } from "@/lib/sync-steps";
import { SyncIcon } from "./SyncIcon";

function stepStatus(stepKey: SyncStep, current: SyncStep): "done" | "active" | "pending" {
  if (current === "done") return "done";
  const currentIdx = SYNC_STEP_ORDER.indexOf(current as (typeof SYNC_STEP_ORDER)[number]);
  const stepIdx = SYNC_STEP_ORDER.indexOf(stepKey as (typeof SYNC_STEP_ORDER)[number]);
  if (currentIdx < 0) return "pending";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

function StepDot({ status }: { status: "done" | "active" | "pending" }) {
  if (status === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-700/40 bg-sky-950/60">
        <SyncIcon state="spinning" size={12} />
      </span>
    );
  }
  return <span className="h-6 w-6 shrink-0 rounded-full border border-zinc-700/80 bg-zinc-900" />;
}

export function SyncPanel() {
  const { syncPanelOpen, syncing, syncStep, syncProgress, syncError } = useDashboard();
  const { t } = useI18n();

  if (!syncPanelOpen && !syncError) return null;

  const steps = [
    { key: "garmin" as const, label: t.sync.stepGarmin },
    { key: "coach" as const, label: t.sync.stepCoach },
    { key: "refresh" as const, label: t.sync.stepRefresh },
  ];

  const allDone = syncStep === "done";

  return (
    <div
      className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
        {syncPanelOpen && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    allDone
                      ? "border-emerald-800/50 bg-emerald-950/40"
                      : "border-sky-800/50 bg-sky-950/50"
                  }`}
                >
                  <SyncIcon
                    state={allDone ? "done" : syncing ? "spinning" : "idle"}
                    size={16}
                  />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {allDone ? t.sync.doneTitle : t.sync.progressTitle}
                </p>
              </div>
              <p className="text-[11px] text-zinc-600">
                {allDone ? t.sync.doneHint : syncing ? t.sync.runningHint : ""}
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {steps.map((step) => {
                const status = stepStatus(step.key, syncStep);
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors ${
                      status === "active"
                        ? "border-sky-700/50 bg-sky-950/40"
                        : status === "done"
                          ? "border-emerald-900/40 bg-emerald-950/20"
                          : "border-zinc-800/60 bg-zinc-900/30"
                    }`}
                  >
                    <StepDot status={status} />
                    <span
                      className={`text-xs font-medium ${
                        status === "active"
                          ? "text-white"
                          : status === "done"
                            ? "text-zinc-400"
                            : "text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  allDone
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500"
                }`}
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </>
        )}

        {syncError && !syncing && (
          <p className="max-w-xl text-sm leading-relaxed text-rose-300">
            {syncError === "cloud"
              ? t.sync.cloudHint
              : syncError.includes("auth mismatch")
                ? t.sync.authMismatch
                : syncError === "Sync failed" || syncError === "Sync worker error (500)"
                  ? t.sync.failed
                  : syncError}
          </p>
        )}
      </div>
    </div>
  );
}
