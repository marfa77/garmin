"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchDashboardClient } from "./dashboard-client";
import { getBasePath } from "./base-path";
import { scheduleSyncPhases, startSmoothProgress, type SyncStep } from "./sync-steps";
import type { DashboardData } from "./types";

type DashboardContextValue = {
  data: DashboardData;
  syncing: boolean;
  syncPanelOpen: boolean;
  syncStep: SyncStep;
  syncProgress: number;
  syncError: string | null;
  sync: () => Promise<boolean>;
  clearSyncError: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  initialData,
  children,
}: {
  initialData: DashboardData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initialData);
  const [syncing, setSyncing] = useState(false);
  const [syncPanelOpen, setSyncPanelOpen] = useState(false);
  const [syncStep, setSyncStep] = useState<SyncStep>("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const cancelPhasesRef = useRef<(() => void) | null>(null);
  const cancelProgressRef = useRef<(() => void) | null>(null);

  const refetch = useCallback(async () => {
    const next = await fetchDashboardClient();
    setData(next);
    return next;
  }, []);

  const resetSyncUi = useCallback(() => {
    cancelPhasesRef.current?.();
    cancelPhasesRef.current = null;
    cancelProgressRef.current?.();
    cancelProgressRef.current = null;
    setSyncing(false);
    setSyncPanelOpen(false);
    setSyncStep("idle");
    setSyncProgress(0);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    setSyncPanelOpen(true);
    setSyncError(null);
    setSyncStep("garmin");
    setSyncProgress(8);

    cancelPhasesRef.current?.();
    cancelProgressRef.current?.();
    cancelPhasesRef.current = scheduleSyncPhases(setSyncStep);
    cancelProgressRef.current = startSmoothProgress(setSyncProgress);

    const base = getBasePath();

    try {
      const res = await fetch(`${base}/api/sync`, { method: "POST" });
      cancelPhasesRef.current?.();
      cancelPhasesRef.current = null;
      cancelProgressRef.current?.();
      cancelProgressRef.current = null;

      if (!res.ok) {
        if (res.status === 404 && process.env.NEXT_PUBLIC_GITHUB_ACTIONS_SYNC_URL) {
          window.open(process.env.NEXT_PUBLIC_GITHUB_ACTIONS_SYNC_URL, "_blank", "noopener");
          setSyncError("cloud");
          resetSyncUi();
          return false;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Sync failed (${res.status})`);
      }

      setSyncStep("refresh");
      setSyncProgress(92);
      await refetch();
      setSyncStep("done");
      setSyncProgress(100);
      setSyncing(false);
      await new Promise((r) => setTimeout(r, 1600));
      setSyncPanelOpen(false);
      setSyncStep("idle");
      setSyncProgress(0);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      if (msg !== "cloud") setSyncError(msg);
      setSyncing(false);
      setSyncStep("idle");
      setSyncProgress(0);
      return false;
    }
  }, [refetch, resetSyncUi]);

  const value = useMemo(
    () => ({
      data,
      syncing,
      syncPanelOpen,
      syncStep,
      syncProgress,
      syncError,
      sync,
      clearSyncError: () => setSyncError(null),
    }),
    [data, syncing, syncPanelOpen, syncStep, syncProgress, syncError, sync]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
