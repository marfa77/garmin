"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./en";
import { ru } from "./ru";
import type { Dictionary, Locale } from "./types";

const STORAGE_KEY = "wellness-locale";

const dictionaries: Record<Locale, Dictionary> = { en, ru };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "ru" ? "ru" : "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === "ru" ? "ru" : "en";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "ru" ? "ru" : "en";
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}

export function translateReadinessLabel(label: string | undefined, t: Dictionary): string {
  if (!label) return t.readiness.moderate;
  const map: Record<string, string> = {
    Prime: t.readiness.prime,
    High: t.readiness.high,
    Moderate: t.readiness.moderate,
    Low: t.readiness.low,
    Poor: t.readiness.poor,
  };
  return map[label] ?? label;
}
