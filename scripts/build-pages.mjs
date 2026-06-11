#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiPath = path.join(ROOT, "src", "app", "api");
const backupPath = path.join(ROOT, ".api-build-backup");

let restored = false;

function restoreApi() {
  if (restored) return;
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, apiPath);
    restored = true;
  }
}

process.on("exit", restoreApi);
process.on("SIGINT", () => {
  restoreApi();
  process.exit(1);
});

if (fs.existsSync(apiPath)) {
  fs.renameSync(apiPath, backupPath);
}

try {
  execSync("next build", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });
  fs.writeFileSync(path.join(ROOT, "out", ".nojekyll"), "");
} finally {
  restoreApi();
}
