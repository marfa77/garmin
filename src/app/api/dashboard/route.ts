import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guard";
import { getLatestDashboardSnapshot } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getLatestDashboardSnapshot(user.id);
  if (!data) {
    return NextResponse.json({ error: "No snapshot yet — run sync" }, { status: 404 });
  }

  return NextResponse.json(data);
}
