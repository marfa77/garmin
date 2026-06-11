import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-guard";
import {
  buildGarminAuthUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  isGarminOAuthConfigured,
} from "@/lib/garmin-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) {
    redirect("/login?next=/connect/garmin");
  }

  if (!isGarminOAuthConfigured()) {
    redirect("/connect/garmin?error=not_configured");
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set(
    "garmin_oauth",
    JSON.stringify({ verifier, state, userId: user.id }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    }
  );

  const url = buildGarminAuthUrl({
    clientId: process.env.GARMIN_CLIENT_ID!.trim(),
    state,
    codeChallenge: challenge,
  });

  redirect(url);
}
