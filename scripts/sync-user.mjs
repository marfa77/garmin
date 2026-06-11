#!/usr/bin/env node
/**
 * Sync one user's Garmin data → Supabase snapshot.
 * Used by POST /api/sync (local fallback) and sync-server.mjs on Hetzner.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { runSyncPipeline } from "./run-sync.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service credentials missing");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function syncUserGarmin(userId) {
  const admin = adminClient();

  const { data: conn, error: connError } = await admin
    .from("garmin_connections")
    .select("token_blob, garmin_email")
    .eq("user_id", userId)
    .single();

  if (connError || !conn?.token_blob) {
    throw new Error("Garmin not connected");
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `garmin-sync-${userId}-`));

  try {
    const result = runSyncPipeline({
      workDir,
      tokenBlob: conn.token_blob,
      garminEmail: conn.garmin_email ?? undefined,
    });

    const { error: insertError } = await admin.from("dashboard_snapshots").insert({
      user_id: userId,
      synced_at: result.syncedAt,
      device: result.payload.device,
      source: result.source,
      payload: result.payload,
    });
    if (insertError) throw insertError;

    await admin
      .from("garmin_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "ok",
        last_sync_error: null,
      })
      .eq("user_id", userId);

    return {
      ok: true,
      syncedAt: result.syncedAt,
      date: result.date,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    await admin
      .from("garmin_connections")
      .update({
        last_sync_status: "failed",
        last_sync_error: message.slice(0, 500),
      })
      .eq("user_id", userId);
    throw err;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
