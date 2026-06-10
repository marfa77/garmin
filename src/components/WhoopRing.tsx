interface WhoopRingProps {
  value: number | string;
  label: string;
  sublabel?: string;
  pct: number;
  color: string;
  size?: "sm" | "lg";
  onClick?: () => void;
  showCrown?: boolean;
  crownLabel?: string;
}

function CrownBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[8px] font-bold uppercase leading-none tracking-wide text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
      {label}
    </span>
  );
}

export function WhoopRing({
  value,
  label,
  sublabel,
  pct,
  color,
  size = "sm",
  onClick,
  showCrown,
  crownLabel = "★ Optimal",
}: WhoopRingProps) {
  const dim = size === "lg" ? 188 : 96;
  const stroke = size === "lg" ? 14 : 8;
  const r = (dim - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex flex-col items-center ${onClick ? "cursor-pointer transition hover:opacity-90" : ""}`}
    >
      <div className="mb-1 flex h-6 w-full items-end justify-center">
        {showCrown && <CrownBadge label={crownLabel} />}
      </div>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke} />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className={`font-semibold text-white ${size === "lg" ? "text-5xl" : "text-xl"}`}>{value}</span>
          <span className={`mt-1 uppercase tracking-widest text-zinc-400 ${size === "lg" ? "text-xs" : "text-[9px]"}`}>
            {label}
          </span>
          {sublabel && <span className="mt-0.5 text-[9px] text-zinc-500">{sublabel}</span>}
        </div>
      </div>
    </Wrapper>
  );
}
