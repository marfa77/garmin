#!/usr/bin/env node
/**
 * Runs Garmin sync + AI coach. Used by npm run sync and POST /api/sync.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(ROOT, ".env") });

function run(cmd, env = process.env) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "pipe", env, encoding: "utf-8" });
  } catch (err) {
    throw new Error((err.stderr || err.stdout || err.message || "Command failed").trim());
  }
}

function restoreGarminTokens(workDir, tokenBlobJson) {
  const parsed = JSON.parse(tokenBlobJson);
  const tokenDir = path.join(workDir, ".garmin-tokens");
  fs.mkdirSync(tokenDir, { recursive: true });
  for (const [name, b64] of Object.entries(parsed.files ?? {})) {
    fs.writeFileSync(path.join(tokenDir, name), Buffer.from(b64, "base64"));
  }
  return tokenDir;
}

export function runSyncPipeline(options = {}) {
  const workDir = options.workDir ?? path.join(ROOT, "data");
  const dataFile = path.join(workDir, "dashboard.json");
  const publicFile = path.join(ROOT, "public", "data", "dashboard.json");

  fs.mkdirSync(workDir, { recursive: true });

  const env = { ...process.env, WELLNESS_DATA_DIR: workDir };

  if (options.tokenBlob) {
    const tokenDir = restoreGarminTokens(workDir, options.tokenBlob);
    env.GARMINTOKENS = tokenDir;
    if (options.garminEmail) env.GARMIN_EMAIL = options.garminEmail;
    if (options.garminPassword) env.GARMIN_PASSWORD = options.garminPassword;
  }

  run("python3 scripts/sync_garmin.py", env);
  try {
    run("node scripts/generate-coach.mjs", { ...env, DATA_PATH: dataFile, PUBLIC_DATA_PATH: publicFile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[sync] coach skipped: ${msg.slice(0, 300)}`);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  return {
    ok: true,
    syncedAt: data.syncedAt,
    date: data.today?.date,
    source: data.source,
    payload: data,
  };
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    const result = runSyncPipeline();
    console.log(JSON.stringify({ ok: true, syncedAt: result.syncedAt, date: result.date, source: result.source }));
  } catch (err) {
    console.error(err.message || "Sync failed");
    process.exit(1);
  }
}
