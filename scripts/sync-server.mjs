#!/usr/bin/env node
/**
 * Hetzner sync worker — Python + OpenRouter coach, called from Vercel /api/sync.
 * POST /sync  Authorization: Bearer SYNC_WORKER_SECRET  { "userId": "uuid" }
 */
import http from "node:http";
import { syncUserGarmin } from "./sync-user.mjs";

const PORT = Number(process.env.SYNC_WORKER_PORT || 3015);
const SECRET = (process.env.SYNC_WORKER_SECRET || "").trim();

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, service: "garmin-wellness-sync" });
  }

  if (req.method !== "POST" || req.url !== "/sync") {
    return send(res, 404, { error: "Not found" });
  }

  const auth = (req.headers.authorization || "").trim();
  if (!SECRET || auth !== `Bearer ${SECRET}`) {
    return send(res, 401, { error: "Unauthorized" });
  }

  try {
    const body = await readJson(req);
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) return send(res, 400, { error: "userId required" });

    const result = await syncUserGarmin(userId);
    return send(res, 200, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[sync-server]", message);
    return send(res, 500, { ok: false, error: message.slice(0, 800) });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[sync-server] listening on :${PORT}`);
});
