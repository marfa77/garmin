import { getBasePath } from "./base-path";
import type { DashboardData } from "./types";

export async function fetchDashboardClient(): Promise<DashboardData> {
  const base = getBasePath();

  const apiRes = await fetch(`${base}/api/dashboard`, { cache: "no-store" });
  if (apiRes.ok) {
    return apiRes.json() as Promise<DashboardData>;
  }

  const url = `${base}/data/dashboard.json?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
  return res.json() as Promise<DashboardData>;
}
