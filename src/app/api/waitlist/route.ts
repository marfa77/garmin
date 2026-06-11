import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const locale = body.locale === "ru" ? "ru" : "en";

  const admin = createServiceRoleClient();
  const { error } = await admin.from("waitlist_signups").upsert(
    {
      email,
      locale,
      price_usd: 10,
      source: "landing",
    },
    { onConflict: "email", ignoreDuplicates: false }
  );

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Waitlist not ready — run DB migration" }, { status: 503 });
    }
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
