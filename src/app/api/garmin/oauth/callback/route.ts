import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { exchangeGarminCode, oauthTokensToBlob } from "@/lib/garmin-oauth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError || !code || !state) {
    redirect("/connect/garmin?error=denied");
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("garmin_oauth")?.value;
  if (!raw) {
    redirect("/connect/garmin?error=session");
  }

  let session: { verifier: string; state: string; userId: string };
  try {
    session = JSON.parse(raw) as { verifier: string; state: string; userId: string };
  } catch {
    redirect("/connect/garmin?error=session");
  }

  if (session.state !== state) {
    redirect("/connect/garmin?error=state");
  }

  try {
    const tokens = await exchangeGarminCode(code, session.verifier);
    const tokenBlob = oauthTokensToBlob(tokens);
    const admin = createServiceRoleClient();

    const { error } = await admin.from("garmin_connections").upsert(
      {
        user_id: session.userId,
        garmin_email: null,
        token_blob: tokenBlob,
        last_login_at: new Date().toISOString(),
        last_sync_status: null,
        mfa_pending: false,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      redirect("/connect/garmin?error=save");
    }

    await admin.from("profiles").update({ onboarding_step: "ready" }).eq("id", session.userId);

    cookieStore.delete("garmin_oauth");
    redirect("/dashboard?garmin=connected");
  } catch {
    redirect("/connect/garmin?error=exchange");
  }
}
