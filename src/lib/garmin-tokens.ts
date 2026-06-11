export type GarminTokenBlob = {
  v: number;
  files: Record<string, string>;
};

/** Parse token bundle pasted after local `npm run garmin:export-tokens`. */
export function parseTokenBlob(raw: string): GarminTokenBlob | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as { v?: number; files?: Record<string, unknown> };
    const files: Record<string, string> = {};

    if (parsed.files && typeof parsed.files === "object") {
      for (const [name, value] of Object.entries(parsed.files)) {
        if (typeof value === "string" && value.length > 8) {
          files[name] = value;
        }
      }
    }

    if (Object.keys(files).length === 0) return null;

    return { v: typeof parsed.v === "number" ? parsed.v : 1, files };
  } catch {
    return null;
  }
}

export function safeApiError(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong. Try again.";
  const msg = err.message;
  if (/password|secret|token|GARMIN_|python3|execSync|command failed/i.test(msg)) {
    return "Connection failed. Check your token and try again.";
  }
  return msg.slice(0, 200);
}
