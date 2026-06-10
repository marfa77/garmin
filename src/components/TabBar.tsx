"use client";

import { useI18n } from "@/lib/i18n";

export type TabId = "overview" | "recovery" | "sleep" | "strain";

export function TabBar({
  active,
  onChange,
  variant = "sidebar",
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  variant?: "sidebar" | "pills";
}) {
  const { t } = useI18n();
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t.tabs.overview },
    { id: "recovery", label: t.tabs.recovery },
    { id: "sleep", label: t.tabs.sleep },
    { id: "strain", label: t.tabs.strain },
  ];

  if (variant === "pills") {
    return (
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-900/80 p-1 lg:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition ${
              active === tab.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden flex-col gap-1 lg:flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
            active === tab.id
              ? "border border-zinc-700/80 bg-zinc-900 text-white shadow-sm"
              : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
