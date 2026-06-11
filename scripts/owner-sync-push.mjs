#!/usr/bin/env node
/** Local sync + push snapshot to Supabase (for owner when Vercel has no Python). */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runSyncPipeline } from "./run-sync.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const email = (process.env.OWNER_EMAILS ?? "pv.inform@gmail.com").split(",")[0].trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
const user = users?.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const result = runSyncPipeline();
const { error } = await admin.from("dashboard_snapshots").insert({
  user_id: user.id,
  synced_at: result.syncedAt,
  device: result.payload.device,
  source: result.source,
  payload: result.payload,
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

await admin
  .from("garmin_connections")
  .update({
    last_sync_at: new Date().toISOString(),
    last_sync_status: "ok",
    last_sync_error: null,
  })
  .eq("user_id", user.id);

console.log(JSON.stringify({ ok: true, syncedAt: result.syncedAt, date: result.date }));
