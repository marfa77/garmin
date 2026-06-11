"use client";

import { useCoachPersona, type CoachPersona } from "@/lib/coach-persona";
import { useI18n } from "@/lib/i18n";

export function CoachPersonaToggle() {
  const { persona, setPersona } = useCoachPersona();
  const { t } = useI18n();

  const options: { id: CoachPersona; label: string }[] = [
    { id: "caring", label: t.coachPersona.caring },
    { id: "sarcastic", label: t.coachPersona.sarcastic },
  ];

  return (
    <div
      className="flex rounded-full border border-zinc-800 bg-zinc-900/90 p-0.5 text-[10px] font-semibold uppercase tracking-wider"
      title={t.coachPersona.hint}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setPersona(opt.id)}
          className={`rounded-full px-2 py-1 transition ${
            persona === opt.id ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
