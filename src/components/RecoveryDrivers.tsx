"use client";

import { useI18n } from "@/lib/i18n";
import { driverInterpretation } from "@/lib/interpretations";
import type { RecoveryDriver } from "@/lib/types";

const impactStyle: Record<RecoveryDriver["impact"], string> = {
  positive: "text-emerald-400",
  high: "text-amber-400",
  medium: "text-sky-400",
  low: "text-zinc-500",
};

export function RecoveryDrivers({ drivers }: { drivers: RecoveryDriver[] }) {
  const { t } = useI18n();
  const impactLabel: Record<RecoveryDriver["impact"], string> = {
    positive: t.drivers.helping,
    high: t.drivers.dragging,
    medium: t.drivers.neutral,
    low: t.drivers.minor,
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{t.drivers.title}</p>
      {drivers.map((d) => (
        <div key={d.factor} className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">{d.label}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${impactStyle[d.impact]}`}>
              {impactLabel[d.impact]}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {d.value}
            {d.delta ? ` · ${d.delta}` : ""}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{driverInterpretation(d, t)}</p>
        </div>
      ))}
    </div>
  );
}
