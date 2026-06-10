"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex rounded-full border border-zinc-800 bg-zinc-900/90 p-0.5 text-[10px] font-semibold uppercase tracking-wider">
      {(["en", "ru"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-2 py-1 transition ${
            locale === code ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
