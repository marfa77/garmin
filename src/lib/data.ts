import fs from "fs";
import path from "path";
import { getSampleDashboard } from "./sample-data";
import type { DashboardData } from "./types";

const DATA_CANDIDATES = [
  path.join(process.cwd(), "data", "dashboard.json"),
  path.join(process.cwd(), "public", "data", "dashboard.json"),
];

export function loadDashboard(): DashboardData {
  try {
    for (const dataPath of DATA_CANDIDATES) {
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, "utf-8");
        return JSON.parse(raw) as DashboardData;
      }
    }
  } catch {
    // fall through to demo
  }
  return getSampleDashboard();
}
