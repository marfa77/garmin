import { userHasAccess } from "@/lib/access";
import { getSessionUser } from "@/lib/auth-guard";
import { parseTokenBlob, safeApiError } from "@/lib/garmin-tokens";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user, supabase } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasAccess = await userHasAccess(supabase, user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const body = (await request.json()) as { tokenBlob?: string; garminEmail?: string };

  if (!body.tokenBlob?.trim()) {
    return NextResponse.json(
      { error: "Paste the token bundle from the local export command." },
      { status: 400 }
    );
  }

  const parsed = parseTokenBlob(body.tokenBlob);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid token format. Run npm run garmin:export-tokens locally and paste the full JSON." },
      { status: 400 }
    );
  }

  try {
    const tokenBlob = JSON.stringify(parsed);
    const admin = createServiceRoleClient();
    const garminEmail = body.garminEmail?.trim() || null;

    const { error } = await admin.from("garmin_connections").upsert(
      {
        user_id: user.id,
        garmin_email: garminEmail,
        token_blob: tokenBlob,
        last_login_at: new Date().toISOString(),
        last_sync_status: null,
        mfa_pending: false,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return NextResponse.json({ error: "Could not save connection." }, { status: 500 });
    }

    await admin.from("profiles").update({ onboarding_step: "ready" }).eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: safeApiError(err) }, { status: 500 });
  }
}
