type SyncIconState = "idle" | "spinning" | "done" | "error";

export function SyncIcon({
  state = "idle",
  size = 16,
  className = "",
}: {
  state?: SyncIconState;
  size?: number;
  className?: string;
}) {
  const color =
    state === "error"
      ? "text-rose-400"
      : state === "done"
        ? "text-emerald-400"
        : state === "spinning"
          ? "text-sky-300"
          : "text-current";

  if (state === "done") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`sync-icon-done ${color} ${className}`}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" opacity="0.35" />
        <path
          d="M8 12.5l2.5 2.5 5.5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sync-icon-check"
        />
      </svg>
    );
  }

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {state === "spinning" && (
        <span
          className="absolute inset-0 rounded-full bg-sky-400/20 sync-icon-glow"
          aria-hidden
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`${color} ${state === "spinning" ? "sync-icon-spin" : ""}`}
      >
        <path
          d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 3v5h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 21h5v-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
