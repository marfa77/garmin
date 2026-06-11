import { execSync } from "child_process";
import { userHasAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const { user, supabase } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasAccess = await userHasAccess(supabase, user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const body = (await request.json()) as { email?: string; password?: string };

  if (!body.email?.trim() || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  try {
    const out = execSync(
      `python3 scripts/garmin_connect.py ${JSON.stringify(body.email)} ${JSON.stringify(body.password)}`,
      {
        cwd: process.cwd(),
        encoding: "utf-8",
        timeout: 90_000,
        env: {
          ...process.env,
          GARMIN_EMAIL: body.email,
          GARMIN_PASSWORD: body.password,
        },
      }
    );

    const result = JSON.parse(out.trim().split("\n").pop() ?? "{}") as {
      ok: boolean;
      error?: string;
      mfa_required?: boolean;
      email?: string;
      files?: Record<string, string>;
    };

    if (!result.ok || !result.files) {
      return NextResponse.json(
        { error: result.error ?? "Garmin login failed", mfaRequired: result.mfa_required },
        { status: 400 }
      );
    }

    const tokenBlob = JSON.stringify({ v: 1, files: result.files });
    const admin = createServiceRoleClient();

    const { error } = await admin.from("garmin_connections").upsert(
      {
        user_id: user.id,
        garmin_email: result.email ?? body.email,
        token_blob: tokenBlob,
        last_login_at: new Date().toISOString(),
        last_sync_status: null,
        mfa_pending: false,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from("profiles").update({ onboarding_step: "ready" }).eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connect failed";
    return NextResponse.json({ error: message.slice(0, 500) }, { status: 500 });
  }
}
