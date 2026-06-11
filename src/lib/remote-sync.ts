export type SyncResult = {
  ok: boolean;
  syncedAt?: string;
  date?: string;
  error?: string;
};

export async function runRemoteGarminSync(userId: string): Promise<SyncResult> {
  const workerUrl = process.env.GARMIN_SYNC_WORKER_URL?.trim().replace(/\/$/, "");
  const secret = process.env.SYNC_WORKER_SECRET?.trim();

  if (!workerUrl || !secret) {
    return { ok: false, error: "Sync worker not configured" };
  }

  const res = await fetch(`${workerUrl}/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
    signal: AbortSignal.timeout(280_000),
  });

  const body = (await res.json().catch(() => ({}))) as SyncResult & { error?: string };

  if (!res.ok) {
    return { ok: false, error: body.error || `Sync worker error (${res.status})` };
  }

  return body;
}

export function isRemoteSyncWorkerConfigured(): boolean {
  return Boolean(
    process.env.GARMIN_SYNC_WORKER_URL?.trim() && process.env.SYNC_WORKER_SECRET?.trim()
  );
}
