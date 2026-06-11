"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CoachPersona } from "./types";

const STORAGE_KEY = "wellness-coach-persona";

type CoachPersonaContextValue = {
  persona: CoachPersona;
  setPersona: (persona: CoachPersona) => void;
};

const CoachPersonaContext = createContext<CoachPersonaContextValue | null>(null);

function readStoredPersona(): CoachPersona {
  if (typeof window === "undefined") return "caring";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "sarcastic" ? "sarcastic" : "caring";
}

export function CoachPersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<CoachPersona>("caring");

  useEffect(() => {
    setPersonaState(readStoredPersona());
  }, []);

  const setPersona = useCallback((next: CoachPersona) => {
    setPersonaState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ persona, setPersona }), [persona, setPersona]);

  return <CoachPersonaContext.Provider value={value}>{children}</CoachPersonaContext.Provider>;
}

export function useCoachPersona() {
  const ctx = useContext(CoachPersonaContext);
  if (!ctx) throw new Error("useCoachPersona must be used within CoachPersonaProvider");
  return ctx;
}
