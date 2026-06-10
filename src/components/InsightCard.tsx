import type { RecoveryZone } from "@/lib/types";

const zoneAccent: Record<RecoveryZone, string> = {
  green: "border-emerald-500/20",
  yellow: "border-amber-500/20",
  red: "border-rose-500/20",
};

export function InsightCard({
  title,
  body,
  zone,
  badge,
}: {
  title: string;
  body: string;
  zone: RecoveryZone;
  badge?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-zinc-900/50 p-5 ${zoneAccent[zone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
        </div>
        {badge && (
          <div className="flex shrink-0 flex-col items-center rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <span className="text-emerald-400">✓</span>
            <span className="mt-1 text-xs font-medium text-zinc-400">{badge}</span>
          </div>
        )}
      </div>
    </div>
  );
}
