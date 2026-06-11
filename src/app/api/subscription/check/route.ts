import { NextResponse } from "next/server";
import { isFreeBeta } from "@/lib/access";
import { getSessionUser } from "@/lib/auth-guard";
import { linkSubscriptionsByEmail } from "@/lib/subscription-link";

export const dynamic = "force-dynamic";

export async function POST() {
  const { user, supabase } = await getSessionUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isFreeBeta()) {
    return NextResponse.json({ ok: true, active: true, freeBeta: true });
  }

  await linkSubscriptionsByEmail(user.id, user.email);

  const { data: hasSub } = await supabase.rpc("has_active_subscription", { uid: user.id });

  return NextResponse.json({ ok: true, active: Boolean(hasSub) });
}
