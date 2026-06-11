export type SyncStep = "idle" | "garmin" | "coach" | "refresh" | "done";

export const SYNC_STEP_ORDER: SyncStep[] = ["garmin", "coach", "refresh"];

export function syncStepIndex(step: SyncStep): number {
  if (step === "idle" || step === "done") return -1;
  return SYNC_STEP_ORDER.indexOf(step);
}

/** Client-side phase timing while waiting for the worker (~45s total). */
export function scheduleSyncPhases(onPhase: (step: SyncStep) => void): () => void {
  onPhase("garmin");
  const t1 = window.setTimeout(() => onPhase("coach"), 8_000);
  const t2 = window.setTimeout(() => onPhase("refresh"), 28_000);

  return () => {
    window.clearTimeout(t1);
    window.clearTimeout(t2);
  };
}

/** Smooth progress bar while the worker runs (caps at 90% until real completion). */
export function startSmoothProgress(
  onProgress: (pct: number) => void,
  estimatedMs = 48_000
): () => void {
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const pct = Math.min(90, 8 + (elapsed / estimatedMs) * 82);
    onProgress(Math.round(pct));
  };
  tick();
  const id = window.setInterval(tick, 350);
  return () => window.clearInterval(id);
}
