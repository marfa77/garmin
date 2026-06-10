"use client";

import { useState } from "react";
import { FactorList } from "./FactorList";
import { MetricGrid } from "./MetricGrid";
import type { DailySummary } from "@/lib/types";

export function DetailsPanel({ today }: { today: DailySummary }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 px-5 py-4 text-left transition hover:bg-zinc-900/60"
      >
        <span className="text-sm font-medium text-zinc-300">Behind the score</span>
        <span className="text-xs text-zinc-500">{open ? "Hide" : "Show"} details</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-zinc-500">What shaped recovery</h3>
            <FactorList drivers={today.recovery.drivers} />
          </div>
          <div>
            <h3 className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Body signals</h3>
            <MetricGrid
              items={[
                { label: "HRV", value: `${today.vitals.hrv} ms`, hint: `baseline ${today.vitals.hrvBaseline}` },
                { label: "Resting HR", value: `${today.vitals.rhr} bpm` },
                { label: "Body Battery", value: `${today.vitals.bodyBatteryNow}` },
                { label: "Fitness age", value: `${today.vitals.fitnessAge}` },
              ]}
            />
          </div>
        </div>
      )}
    </section>
  );
}
