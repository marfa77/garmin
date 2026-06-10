"use client";

import { useI18n } from "@/lib/i18n";
import type { ContributorBar } from "@/lib/contributors";

const barColor: Record<ContributorBar["status"], string> = {
  optimal: "from-emerald-400 to-emerald-600",
  good: "from-sky-400 to-sky-600",
  sufficient: "from-amber-400 to-amber-600",
  pay_attention: "from-rose-400 to-rose-600",
};

export function ContributorBars({
  items,
  compact = false,
  title,
}: {
  items: ContributorBar[];
  compact?: boolean;
  title?: string;
}) {
  const { t } = useI18n();

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && (title ?? t.contributors.title) && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {title ?? t.contributors.title}
        </p>
      )}
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">{item.label}</span>
            <span className="tabular-nums text-zinc-500">{item.pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barColor[item.status]} transition-all duration-700`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
          {!compact && <p className="mt-0.5 text-[10px] text-zinc-500">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}
