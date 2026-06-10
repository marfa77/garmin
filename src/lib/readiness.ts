import type { ReadinessZone } from "./types";

export const READINESS_COLORS: Record<ReadinessZone, { ring: string; text: string; glow: string }> = {
  prime: { ring: "#a855f7", text: "text-violet-400", glow: "#a855f755" },
  high: { ring: "#38bdf8", text: "text-sky-400", glow: "#38bdf855" },
  moderate: { ring: "#3ecf8e", text: "text-emerald-400", glow: "#3ecf8e55" },
  low: { ring: "#fb923c", text: "text-orange-400", glow: "#fb923c55" },
  poor: { ring: "#f87171", text: "text-rose-400", glow: "#f8717155" },
};

export function isOptimalDay(recovery: number, sleep: number): boolean {
  return recovery >= 85 && sleep >= 85;
}
