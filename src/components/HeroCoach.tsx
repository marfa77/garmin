import type { CoachMessage } from "@/lib/coach-types";
import type { RecoveryZone } from "@/lib/types";

const zoneStyles: Record<RecoveryZone, { ring: string; bg: string; text: string }> = {
  green: { ring: "border-emerald-500/30", bg: "from-emerald-950/40", text: "text-emerald-400" },
  yellow: { ring: "border-amber-500/30", bg: "from-amber-950/40", text: "text-amber-400" },
  red: { ring: "border-rose-500/30", bg: "from-rose-950/40", text: "text-rose-400" },
};

interface HeroCoachProps {
  coach: CoachMessage;
  zone: RecoveryZone;
  zoneLabel: string;
  period: "morning" | "evening";
}

export function HeroCoach({ coach, zone, zoneLabel, period }: HeroCoachProps) {
  const s = zoneStyles[zone];

  return (
    <section
      className={`mb-8 rounded-3xl border bg-gradient-to-br to-zinc-950 p-8 ${s.ring} ${s.bg}`}
    >
      <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.25em] ${s.text}`}>
        {period === "morning" ? "Today" : "Tonight"} · {zoneLabel}
      </p>
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
        {coach.headline}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300">{coach.insight}</p>
      {coach.action && (
        <p className="mt-5 border-t border-zinc-800/80 pt-5 text-sm font-medium text-zinc-200">
          → {coach.action}
        </p>
      )}
    </section>
  );
}
