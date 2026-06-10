import type { Status } from "@/lib/interpretations";

const barColor: Record<Status, string> = {
  optimal: "bg-emerald-400",
  good: "bg-emerald-400",
  sufficient: "bg-sky-400",
  pay_attention: "bg-amber-400",
  poor: "bg-rose-400",
};

export function ProgressMetric({
  label,
  value,
  pct,
  status,
}: {
  label: string;
  value: string;
  pct: number;
  status: Status;
}) {
  return (
    <div className="border-b border-zinc-800/80 py-4 last:border-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="text-sm font-medium text-zinc-300">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${barColor[status]}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
