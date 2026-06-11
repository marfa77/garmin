import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function requireOnboardedUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string };
  profile: Profile;
}> {
  const { supabase, user } = await requireUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect("/login");

  const { data: hasSub } = await supabase.rpc("has_active_subscription", { uid: user.id });
  if (!hasSub) redirect("/subscribe");

  const { data: garmin } = await supabase
    .from("garmin_connection_status")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!garmin) redirect("/connect/garmin");

  return { supabase, user, profile: profile as Profile };
}
