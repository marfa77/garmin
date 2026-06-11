import type { DashboardData } from "@/lib/types";
import type { GarminConnectionStatus, Profile, Subscription } from "./database.types";
import { createClient } from "./server";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("has_active_subscription", { uid: userId });
  if (error) throw error;
  return Boolean(data);
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Subscription | null;
}

export async function getGarminConnectionStatus(userId: string): Promise<GarminConnectionStatus | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("garmin_connection_status")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as GarminConnectionStatus | null;
}

export async function getLatestDashboardSnapshot(userId: string): Promise<DashboardData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dashboard_snapshots")
    .select("payload")
    .eq("user_id", userId)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.payload as DashboardData | undefined) ?? null;
}
