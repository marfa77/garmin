import type { Status, Trend } from "@/lib/interpretations";

const statusColor: Record<Status, string> = {
  optimal: "bg-emerald-400",
  good: "bg-emerald-400",
  sufficient: "bg-sky-400",
  pay_attention: "bg-amber-400",
  poor: "bg-rose-400",
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <span className="text-emerald-400 text-xs">▲</span>;
  if (trend === "down") return <span className="text-amber-400 text-xs">▼</span>;
  return <span className="text-zinc-500 text-xs">●</span>;
}

interface MetricRowProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  trend?: Trend;
  status?: Status;
}

export function MetricRow({ icon, label, value, unit, hint, trend, status }: MetricRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-800/80 py-4 last:border-0">
      {icon && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
        {hint && <p className="mt-0.5 text-sm text-zinc-400">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        {trend && <TrendIcon trend={trend} />}
        <span className="text-lg font-semibold text-white">
          {value}
          {unit && <span className="ml-0.5 text-sm font-normal text-zinc-500">{unit}</span>}
        </span>
        {status && <span className={`h-2.5 w-2.5 rounded-sm ${statusColor[status]}`} />}
      </div>
    </div>
  );
}
