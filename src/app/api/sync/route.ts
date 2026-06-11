import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceRoleClient();

  const { data: hasSub } = await admin.rpc("has_active_subscription", { uid: user.id });
  if (!hasSub) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { data: conn, error: connError } = await admin
    .from("garmin_connections")
    .select("token_blob, garmin_email")
    .eq("user_id", user.id)
    .single();

  if (connError || !conn?.token_blob) {
    return NextResponse.json({ error: "Garmin not connected" }, { status: 400 });
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `garmin-sync-${user.id}-`));

  try {
    const { runSyncPipeline } = await import("../../../../scripts/run-sync.mjs");
    const result = runSyncPipeline({
      workDir,
      tokenBlob: conn.token_blob,
      garminEmail: conn.garmin_email ?? undefined,
    });

    await admin.from("dashboard_snapshots").insert({
      user_id: user.id,
      synced_at: result.syncedAt,
      device: result.payload.device,
      source: result.source,
      payload: result.payload,
    });

    await admin
      .from("garmin_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "ok",
        last_sync_error: null,
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      ok: true,
      syncedAt: result.syncedAt,
      date: result.date,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    await admin
      .from("garmin_connections")
      .update({
        last_sync_status: "failed",
        last_sync_error: message.slice(0, 500),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ ok: false, error: message.slice(0, 800) }, { status: 500 });
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
