#!/usr/bin/env node
/**
 * One-time owner bootstrap:
 * - set Supabase password
 * - seed Garmin token_blob (local export)
 * - push latest dashboard.json snapshot
 *
 * Usage: node scripts/owner-setup.mjs pv.inform@gmail.com 'Dubai1234!'
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const email = (process.argv[2] ?? "pv.inform@gmail.com").trim().toLowerCase();
const password = process.argv[3];

if (!password) {
  console.error("Usage: node scripts/owner-setup.mjs <email> <password>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUser() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) throw new Error(`User not found: ${email}`);
  return user;
}

function exportGarminTokens() {
  try {
    const out = execSync("python3 scripts/garmin-export-tokens.py", {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const line = out.trim().split("\n").find((l) => l.startsWith("{"));
    if (!line) return null;
    const parsed = JSON.parse(line);
    if (!parsed.files || Object.keys(parsed.files).length === 0) return null;
    return JSON.stringify({ v: 1, files: parsed.files });
  } catch (err) {
    console.warn("Garmin token export skipped:", err.stderr?.toString() || err.message);
    return null;
  }
}

async function main() {
  const user = await findUser();

  const { error: pwError } = await admin.auth.admin.updateUserById(user.id, { password });
  if (pwError) throw pwError;
  console.log(`Password set for ${email}`);

  await admin.from("profiles").upsert(
    {
      id: user.id,
      email,
      onboarding_step: "ready",
      locale: "ru",
    },
    { onConflict: "id" }
  );

  const tokenBlob = exportGarminTokens();
  if (tokenBlob) {
    const { error } = await admin.from("garmin_connections").upsert(
      {
        user_id: user.id,
        garmin_email: process.env.GARMIN_EMAIL ?? email,
        token_blob: tokenBlob,
        token_version: 1,
        last_login_at: new Date().toISOString(),
        mfa_pending: false,
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    console.log("Garmin tokens saved to garmin_connections");
  } else {
    console.warn("No Garmin tokens — set GARMIN_EMAIL/GARMIN_PASSWORD in .env and re-run");
  }

  const dataPath = path.join(ROOT, "data", "dashboard.json");
  if (fs.existsSync(dataPath)) {
    const payload = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const { error } = await admin.from("dashboard_snapshots").insert({
      user_id: user.id,
      synced_at: payload.syncedAt ?? new Date().toISOString(),
      device: payload.device ?? "Garmin Venu 2",
      source: payload.source ?? "garmin",
      payload,
    });
    if (error) throw error;
    console.log("Dashboard snapshot uploaded");
  } else {
    console.warn("No data/dashboard.json — run npm run sync first for live data");
  }

  console.log("\nDone. Sign in at /login with password, then /dashboard");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
