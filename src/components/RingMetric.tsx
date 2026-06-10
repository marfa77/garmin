interface RingMetricProps {
  label: string;
  value: number | string;
  unit?: string;
  max?: number;
  color: string;
  subtitle?: string;
}

export function RingMetric({ label, value, unit, max = 100, color, subtitle }: RingMetricProps) {
  const numeric = typeof value === "number" ? value : parseFloat(value);
  const pct = Math.min(100, Math.max(0, (numeric / max) * 100));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 md:h-32 md:w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {typeof value === "number" && unit === "%" ? Math.round(value) : value}
          </span>
          {unit && <span className="text-xs text-zinc-400">{unit}</span>}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-300">{label}</p>
        {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}
