"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchDashboardClient } from "./dashboard-client";
import { getBasePath } from "./base-path";
import type { DashboardData } from "./types";

type DashboardContextValue = {
  data: DashboardData;
  syncing: boolean;
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
  const [syncError, setSyncError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const next = await fetchDashboardClient();
    setData(next);
    return next;
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    const base = getBasePath();

    try {
      const res = await fetch(`${base}/api/sync`, { method: "POST" });
      if (!res.ok) {
        if (res.status === 404 && process.env.NEXT_PUBLIC_GITHUB_ACTIONS_SYNC_URL) {
          window.open(process.env.NEXT_PUBLIC_GITHUB_ACTIONS_SYNC_URL, "_blank", "noopener");
          setSyncError("cloud");
          return false;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Sync failed (${res.status})`);
      }
      await refetch();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      if (msg !== "cloud") setSyncError(msg);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [refetch]);

  const value = useMemo(
    () => ({
      data,
      syncing,
      syncError,
      sync,
      clearSyncError: () => setSyncError(null),
    }),
    [data, syncing, syncError, sync]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
