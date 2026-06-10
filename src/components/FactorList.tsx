import type { RecoveryDriver } from "@/lib/types";

const humanImpact: Record<RecoveryDriver["impact"], string> = {
  high: "Pulling you down",
  medium: "Neutral",
  low: "Stable",
  positive: "Helping",
};

export function FactorList({ drivers }: { drivers: RecoveryDriver[] }) {
  return (
    <div className="space-y-2">
      {drivers.map((d) => (
        <div key={d.factor} className="flex items-center justify-between rounded-xl bg-zinc-900/60 px-4 py-3">
          <p className="text-sm text-zinc-300">{d.label}</p>
          <span className="text-xs text-zinc-500">{humanImpact[d.impact]}</span>
        </div>
      ))}
    </div>
  );
}
