"use client";

import { useI18n } from "@/lib/i18n";

export function SleepInsightPanel({
  insight,
  onExplore,
}: {
  insight: string;
  onExplore?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
      <p className="text-sm leading-relaxed text-zinc-300">{insight}</p>
      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-sky-400 transition hover:text-sky-300"
        >
          {t.sleep.exploreInsights} →
        </button>
      )}
    </div>
  );
}
